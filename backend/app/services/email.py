import resend
from app.core.config import settings

resend.api_key = settings.resend_api_key or ""


async def send_email(to: str, subject: str, html: str) -> bool:
    if not settings.resend_api_key:
        print(f"[EMAIL STUB] To: {to} | Subject: {subject}")
        print(f"[EMAIL STUB] Body preview: {html[:200]}...")
        return True

    try:
        resend.Emails.send({
            "from": settings.email_from,
            "to": to,
            "subject": subject,
            "html": html,
        })
        print(f"[EMAIL SENT] To: {to} | Subject: {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to}: {e}")
        return False


async def send_verification_email(email: str, token: str):
    verify_url = f"{settings.frontend_url}/auth/verify?token={token}"
    html = f"""
    <div style="max-width:480px;margin:0 auto;font-family:Inter,Arial,sans-serif">
        <h2 style="color:#10B981">RentSaathi</h2>
        <h3>Verify your email address</h3>
        <p>Click the button below to verify your email and activate your account.</p>
        <a href="{verify_url}" style="display:inline-block;padding:12px 24px;background:#10B981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
        <p style="color:#666;font-size:12px;margin-top:24px">If you didn't create this account, you can safely ignore this email.</p>
    </div>
    """
    return await send_email(email, "Verify your RentSaathi email", html)


async def send_password_reset_email(email: str, token: str):
    reset_url = f"{settings.frontend_url}/auth/reset?token={token}"
    html = f"""
    <div style="max-width:480px;margin:0 auto;font-family:Inter,Arial,sans-serif">
        <h2 style="color:#10B981">RentSaathi</h2>
        <h3>Reset your password</h3>
        <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
        <a href="{reset_url}" style="display:inline-block;padding:12px 24px;background:#10B981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#666;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    return await send_email(email, "Reset your RentSaathi password", html)


async def send_match_notification(email: str, match_id: str):
    match_url = f"{settings.frontend_url}/matches/{match_id}"
    html = f"""
    <div style="max-width:480px;margin:0 auto;font-family:Inter,Arial,sans-serif">
        <h2 style="color:#10B981">RentSaathi</h2>
        <h3>New Property Match!</h3>
        <p>A verified broker has a property matching your requirement. Review it now.</p>
        <a href="{match_url}" style="display:inline-block;padding:12px 24px;background:#10B981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View Match</a>
    </div>
    """
    return await send_email(email, "New Match — RentSaathi", html)


async def send_broker_verified_email(email: str, broker_name: str):
    login_url = f"{settings.frontend_url}/auth/login"
    html = f"""
    <div style="max-width:480px;margin:0 auto;font-family:Inter,Arial,sans-serif">
        <h2 style="color:#10B981">RentSaathi</h2>
        <h3>Broker Account Verified!</h3>
        <p>Congratulations {broker_name}, your broker profile has been verified. You can now list properties and receive matches.</p>
        <a href="{login_url}" style="display:inline-block;padding:12px 24px;background:#10B981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Login to Dashboard</a>
    </div>
    """
    return await send_email(email, "Broker Verified — RentSaathi", html)


async def send_admin_alert(subject: str, body: str):
    html = f"""
    <div style="max-width:480px;margin:0 auto;font-family:Inter,Arial,sans-serif">
        <h2 style="color:#10B981">RentSaathi Admin</h2>
        <h3>{subject}</h3>
        <p>{body}</p>
        <a href="{settings.frontend_url}/admin" style="display:inline-block;padding:12px 24px;background:#10B981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Go to Admin</a>
    </div>
    """
    return await send_email(settings.email_from, subject, html)
