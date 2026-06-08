from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.api.v1 import router as v1_router
from app.models import (
    User,
    BrokerProfile,
    Requirement,
    Property,
    Match,
    Complaint,
    AuditLog,
    Notification,
    Session,
    ContactLedger,
)
from app.middleware.audit import AuditMiddleware
from app.middleware.rate_limit import limiter

# ── Sentry (optional) ────────────────────────────────────────────────
if settings.sentry_dsn:
    import sentry_sdk
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        traces_sample_rate=0.2 if settings.environment == "production" else 1.0,
        profiles_sample_rate=0.1,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate secrets in production
    settings.validate_secret()

    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]

    await init_beanie(
        database=db,
        document_models=[
            User,
            BrokerProfile,
            Requirement,
            Property,
            Match,
            Complaint,
            AuditLog,
            Notification,
            Session,
            ContactLedger,
        ],
    )

    # Create MongoDB indexes
    await ensure_indexes()

    # Seed dev admin (only in development, only if no admin exists)
    if settings.environment == "development":
        await seed_dev_admin()

    app.state.db = db
    app.state.client = client
    app.state.limiter = limiter
    yield
    from app.core.redis import close_redis
    await close_redis()
    client.close()


async def ensure_indexes():
    """Create indexes for all collections to prevent slow queries at scale."""
    from app.models.user import User
    from app.models.broker import BrokerProfile
    from app.models.requirement import Requirement
    from app.models.property import Property
    from app.models.match import Match
    from app.models.complaint import Complaint
    from app.models.audit import AuditLog
    from app.models.notification import Notification
    from app.models.session import Session as SessionModel
    from app.models.contact_ledger import ContactLedger as ContactLedgerModel

    # User indexes
    await User.get_motor_collection().create_index("email", unique=True)
    await User.get_motor_collection().create_index("role")
    await User.get_motor_collection().create_index([("role", 1), ("is_verified", 1)])
    await User.get_motor_collection().create_index("created_at")

    # BrokerProfile indexes
    await BrokerProfile.get_motor_collection().create_index("user_id", unique=True)
    await BrokerProfile.get_motor_collection().create_index("verification_status")
    await BrokerProfile.get_motor_collection().create_index("trust_score")
    await BrokerProfile.get_motor_collection().create_index("availability")
    await BrokerProfile.get_motor_collection().create_index("last_seen")

    # Requirement indexes
    await Requirement.get_motor_collection().create_index("user_id")
    await Requirement.get_motor_collection().create_index("status")
    await Requirement.get_motor_collection().create_index([("city", 1), ("area", 1)])
    await Requirement.get_motor_collection().create_index([("status", 1), ("created_at", -1)])

    # Property indexes
    await Property.get_motor_collection().create_index("broker_id")
    await Property.get_motor_collection().create_index("status")
    await Property.get_motor_collection().create_index([("city", 1), ("area", 1)])
    await Property.get_motor_collection().create_index([("status", 1), ("created_at", -1)])

    # Match indexes
    await Match.get_motor_collection().create_index("requirement_id")
    await Match.get_motor_collection().create_index("property_id")
    await Match.get_motor_collection().create_index("status")
    await Match.get_motor_collection().create_index("admin_approved")
    await Match.get_motor_collection().create_index([("requirement_id", 1), ("property_id", 1)], unique=True)

    # Complaint indexes
    await Complaint.get_motor_collection().create_index("filed_by")
    await Complaint.get_motor_collection().create_index("status")
    await Complaint.get_motor_collection().create_index("match_id")

    # AuditLog indexes
    await AuditLog.get_motor_collection().create_index([("timestamp", -1)])
    await AuditLog.get_motor_collection().create_index("user_id")
    await AuditLog.get_motor_collection().create_index("action")

    # Notification indexes
    await Notification.get_motor_collection().create_index("user_id")
    await Notification.get_motor_collection().create_index([("user_id", 1), ("read", 1)])
    await Notification.get_motor_collection().create_index([("created_at", -1)])
    # TTL index: auto-delete notifications after 90 days
    await Notification.get_motor_collection().create_index(
        "created_at", expireAfterSeconds=90 * 24 * 60 * 60, name="notification_ttl_90d"
    )

    # Session indexes
    await SessionModel.get_motor_collection().create_index("user_id")
    await SessionModel.get_motor_collection().create_index([("user_id", 1), ("is_active", 1)])
    await SessionModel.get_motor_collection().create_index("last_seen")
    # TTL index: auto-delete sessions after 90 days
    await SessionModel.get_motor_collection().create_index(
        "created_at", expireAfterSeconds=90 * 24 * 60 * 60, name="session_ttl_90d"
    )

    # ContactLedger indexes
    await ContactLedgerModel.get_motor_collection().create_index("match_id", unique=True)
    await ContactLedgerModel.get_motor_collection().create_index("renter_id")
    await ContactLedgerModel.get_motor_collection().create_index("broker_id")
    await ContactLedgerModel.get_motor_collection().create_index([("shared_at", -1)])


async def seed_dev_admin():
    """Create a default admin user for development if one doesn't exist."""
    from app.models.user import User
    from app.core.security import hash_password

    existing = await User.find_one(User.role == "admin")
    if existing:
        return

    admin = User(
        email=settings.dev_admin_email,
        password_hash=hash_password(settings.dev_admin_password),
        full_name="Dev Admin",
        phone="0000000000",
        role="admin",
        is_verified=True,
    )
    await admin.insert()
    print(f"[DEV] Seeded admin: {settings.dev_admin_email} / {settings.dev_admin_password}")


app = FastAPI(
    title="RentSaathi API",
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan,
)

# ── Rate Limiting ─────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ── Security Headers Middleware ───────────────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.environment == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ── CORS (multi-domain) ────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
)


# ── Audit Middleware ──────────────────────────────────────────────
app.add_middleware(AuditMiddleware)


# ── CSRF for cookie auth ──────────────────────────────────────────
@app.middleware("http")
async def csrf_protection(request: Request, call_next):
    if request.method in ("POST", "PATCH", "PUT", "DELETE"):
        content_type = request.headers.get("content-type", "")
        auth_header = request.headers.get("authorization", "")

        has_session = request.cookies.get("access_token") or request.cookies.get("refresh_token")
        if has_session and "application/json" in content_type and not auth_header:
            csrf_token = request.headers.get("x-csrf-token", "")
            cookie_token = request.cookies.get("csrf_token", "")
            if not csrf_token or not cookie_token or csrf_token != cookie_token:
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CSRF token missing or invalid"},
                )

    response = await call_next(request)
    return response


# ── CSRF token endpoint ───────────────────────────────────────────
@app.get("/api/v1/auth/csrf")
async def get_csrf_token():
    import secrets
    token = secrets.token_hex(32)
    is_prod = settings.environment == "production"
    response = JSONResponse({"csrf_token": token})
    response.set_cookie(
        key="csrf_token",
        value=token,
        httponly=False,  # JS must read this
        secure=is_prod,
        samesite="none" if is_prod else "lax",
        max_age=60 * 60,
        path="/",
    )
    return response


# ── Routes ────────────────────────────────────────────────────────
app.include_router(v1_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
