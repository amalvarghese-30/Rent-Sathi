from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from fastapi.security import HTTPBearer
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.session import Session as UserSession
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.core.config import settings
from app.services.email import send_verification_email, send_password_reset_email
from app.services.device import parse_user_agent
from app.middleware.rate_limit import limiter, LOGIN_LIMIT, REGISTER_LIMIT, FORGOT_PASSWORD_LIMIT
from datetime import datetime, timedelta
import hashlib
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


@router.get("/csrf")
async def csrf_token(response: Response):
    token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="csrf_token",
        value=token,
        httponly=False,
        secure=settings.environment == "production",
        samesite="strict" if settings.environment == "production" else "lax",
        max_age=86400,
        path="/",
    )
    return {"csrf_token": token}

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
MAX_SESSIONS_PER_USER = 10


def set_refresh_cookie(response: Response, token: str):
    is_prod = settings.environment == "production"
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=is_prod,
        samesite="strict" if is_prod else "lax",
        max_age=60 * 60 * 24 * 7,
        path="/api/v1/auth",
    )


def set_access_cookie(response: Response, token: str):
    is_prod = settings.environment == "production"
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=is_prod,
        samesite="strict" if is_prod else "lax",
        max_age=60 * 15,
        path="/",
    )


async def create_session(user: User, refresh_token: str, request: Request) -> UserSession:
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    ua = request.headers.get("user-agent", "")
    device_info = parse_user_agent(ua)
    ip = request.client.host if request.client else ""

    session = UserSession(
        user_id=str(user.id),
        token_hash=token_hash,
        device=device_info["device"],
        browser=device_info["browser"],
        os=device_info["os"],
        ip_address=ip,
        is_active=True,
        created_at=datetime.utcnow(),
        last_seen=datetime.utcnow(),
    )
    await session.insert()

    # Update BrokerProfile last_seen
    if user.role == "broker":
        from app.models.broker import BrokerProfile
        broker = await BrokerProfile.find_one(BrokerProfile.user_id == str(user.id))
        if broker:
            broker.last_seen = datetime.utcnow()
            await broker.save()

    # Enforce session limit: deactivate oldest if over limit
    active_sessions = await UserSession.find(
        UserSession.user_id == str(user.id),
        UserSession.is_active == True,
    ).sort(+UserSession.created_at).to_list()

    if len(active_sessions) > MAX_SESSIONS_PER_USER:
        to_deactivate = active_sessions[:len(active_sessions) - MAX_SESSIONS_PER_USER]
        for s in to_deactivate:
            s.is_active = False
            await s.save()

    return session


async def check_new_device(user: User, request: Request) -> bool:
    """Returns True if this is a new device/IP for this user."""
    ua = request.headers.get("user-agent", "")
    device_info = parse_user_agent(ua)
    ip = request.client.host if request.client else ""

    existing = await UserSession.find_one(
        UserSession.user_id == str(user.id),
        UserSession.ip_address == ip,
        UserSession.browser == device_info["browser"],
        UserSession.is_active == True,
    )
    return existing is None


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(REGISTER_LIMIT)
async def register(request: Request, data: UserRegisterRequest, response: Response):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=data.role,
        is_verified=settings.environment == "development",  # auto-verify in dev
    )
    await user.insert()

    # Auto-create BrokerProfile when role is "broker"
    if data.role == "broker":
        from app.models.broker import BrokerProfile
        existing = await BrokerProfile.find_one(BrokerProfile.user_id == str(user.id))
        if not existing:
            broker_profile = BrokerProfile(
                user_id=str(user.id),
                last_seen=datetime.utcnow(),
                availability="Inactive",
            )
            await broker_profile.insert()

    if settings.environment == "development":
        print(f"[DEV] Auto-verified user: {user.email}")
    else:
        verify_token = create_access_token(str(user.id), user.role)
        await send_verification_email(user.email, verify_token)

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id))
    user.refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    await user.save()

    await create_session(user, refresh_token, request)

    set_refresh_cookie(response, refresh_token)
    set_access_cookie(response, access_token)

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        is_verified=user.is_verified,
        verification_badge=user.verification_badge,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit(LOGIN_LIMIT)
async def login(request: Request, data: UserLoginRequest, response: Response):
    user = await User.find_one(User.email == data.email)

    if not user or not verify_password(data.password, user.password_hash):
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
                user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
            await user.save()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.locked_until and user.locked_until > datetime.utcnow():
        remaining = int((user.locked_until - datetime.utcnow()).total_seconds() / 60)
        raise HTTPException(
            status_code=423,
            detail=f"Account locked. Try again in {remaining} minute(s).",
        )

    if not user.is_verified and settings.environment == "production":
        verify_token = create_access_token(str(user.id), user.role)
        await send_verification_email(user.email, verify_token)
        raise HTTPException(
            status_code=403,
            detail="Email not verified. A new verification link has been sent.",
        )

    # Check for new device login
    is_new_device = await check_new_device(user, request)
    if is_new_device and settings.resend_api_key:
        ua = request.headers.get("user-agent", "")
        device_info = parse_user_agent(ua)
        from app.services.email import send_email
        ip = request.client.host if request.client else "unknown"
        await send_email(
            user.email,
            "New Login Detected — RentSaathi",
            f"""<div style="max-width:480px;margin:0 auto;font-family:Inter,Arial,sans-serif">
                <h2 style="color:#10B981">RentSaathi</h2>
                <h3>New Login Detected</h3>
                <p>Your account was accessed from a new device:</p>
                <ul>
                    <li><strong>Device:</strong> {device_info['device']}</li>
                    <li><strong>Browser:</strong> {device_info['browser']}</li>
                    <li><strong>OS:</strong> {device_info['os']}</li>
                    <li><strong>IP:</strong> {ip}</li>
                    <li><strong>Time:</strong> {datetime.utcnow().isoformat()}</li>
                </ul>
                <p style="color:#666">If this was you, no action is needed. If not, reset your password immediately.</p>
            </div>""",
        )

    user.failed_login_attempts = 0
    user.locked_until = None

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id))
    user.refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    await user.save()

    await create_session(user, refresh_token, request)

    set_refresh_cookie(response, refresh_token)
    set_access_cookie(response, access_token)

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role,
            is_verified=user.is_verified,
            verification_badge=user.verification_badge,
            created_at=user.created_at,
        ),
    )


@router.post("/verify-email/{token}")
async def verify_email(token: str):
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid verification token")

    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.is_verified = True
    await user.save()

    return {"message": "Email verified successfully"}


@router.post("/logout")
async def logout(response: Response, request: Request, user: User = Depends(get_current_user)):
    # Deactivate the current session
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        session = await UserSession.find_one(
            UserSession.user_id == str(user.id),
            UserSession.token_hash == token_hash,
        )
        if session:
            session.is_active = False
            await session.save()

    user.refresh_token_hash = None
    user.token_invalidated_at = datetime.utcnow()
    await user.save()
    response.delete_cookie("refresh_token", path="/api/v1/auth")
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@router.get("/sessions")
async def list_sessions(user: User = Depends(get_current_user)):
    sessions = await UserSession.find(
        UserSession.user_id == str(user.id),
        UserSession.is_active == True,
    ).sort(-UserSession.last_seen).to_list()

    return [
        {
            "id": str(s.id),
            "device": s.device,
            "browser": s.browser,
            "os": s.os,
            "ip_address": s.ip_address,
            "location": s.location,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "last_seen": s.last_seen.isoformat() if s.last_seen else None,
        }
        for s in sessions
    ]


@router.delete("/sessions/{session_id}")
async def revoke_session(session_id: str, user: User = Depends(get_current_user)):
    session = await UserSession.get(session_id)
    if not session or session.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Session not found")

    session.is_active = False
    await session.save()
    return {"message": "Session revoked"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    payload = decode_token(refresh_token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await User.get(user_id)
    if not user or not user.refresh_token_hash:
        raise HTTPException(status_code=401, detail="Invalid token")

    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    if not user.refresh_token_hash == token_hash:
        raise HTTPException(status_code=401, detail="Token mismatch")

    # Update session last_seen
    session = await UserSession.find_one(
        UserSession.user_id == user_id,
        UserSession.token_hash == token_hash,
    )
    if session:
        session.last_seen = datetime.utcnow()
        session.token_hash = None  # will be set below
        await session.save()

    access_token = create_access_token(str(user.id), user.role)
    new_refresh_token = create_refresh_token(str(user.id))
    user.refresh_token_hash = hashlib.sha256(new_refresh_token.encode()).hexdigest()
    await user.save()

    # Update session with new token hash
    if session:
        session.token_hash = hashlib.sha256(new_refresh_token.encode()).hexdigest()
        await session.save()

    set_refresh_cookie(response, new_refresh_token)
    set_access_cookie(response, access_token)

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role,
            is_verified=user.is_verified,
            verification_badge=user.verification_badge,
            created_at=user.created_at,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        is_verified=user.is_verified,
        verification_badge=user.verification_badge,
        created_at=user.created_at,
    )


@router.post("/forgot-password")
@limiter.limit(FORGOT_PASSWORD_LIMIT)
async def forgot_password(request: Request, data: ForgotPasswordRequest):
    user = await User.find_one(User.email == data.email)
    if user:
        reset_token = create_access_token(str(user.id), user.role)
        await send_password_reset_email(user.email, reset_token)
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    payload = decode_token(data.token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    user.password_hash = hash_password(data.new_password)
    user.refresh_token_hash = None
    user.locked_until = None
    user.failed_login_attempts = 0
    await user.save()

    # Deactivate all sessions — user needs to re-login
    await UserSession.find(
        UserSession.user_id == user_id,
        UserSession.is_active == True,
    ).update_many({"$set": {"is_active": False}})

    return {"message": "Password reset successful"}
