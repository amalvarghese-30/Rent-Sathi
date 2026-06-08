"""Automatic alert detection from audit logs."""

from datetime import datetime, timedelta
from app.models.audit import AuditLog
from app.models.user import User
from app.services.email import send_admin_alert

ALERT_WINDOW = 60  # minutes


async def check_alerts():
    """Check for anomaly patterns and alert admins."""
    now = datetime.utcnow()
    window_start = now - timedelta(minutes=ALERT_WINDOW)

    # --- 50+ failed logins in window ---
    failed_logins = await AuditLog.find(
        AuditLog.action == "POST",
        AuditLog.resource == "auth",
        AuditLog.timestamp >= window_start,
    ).count()

    if failed_logins >= 50:
        await send_admin_alert(
            "High Login Failure Rate",
            f"{failed_logins} failed login attempts in the last {ALERT_WINDOW} minutes.",
        )

    # --- 10+ broker rejections ---
    broker_rejections = await AuditLog.find(
        AuditLog.action == "POST",
        AuditLog.resource == "admin",
        AuditLog.timestamp >= window_start,
    ).count()

    if broker_rejections >= 10:
        await send_admin_alert(
            "High Broker Rejection Rate",
            f"{broker_rejections} broker verification actions in the last {ALERT_WINDOW} minutes.",
        )

    # --- 100+ uploads in window ---
    upload_count = await AuditLog.find(
        AuditLog.action == "POST",
        AuditLog.resource == "uploads",
        AuditLog.timestamp >= window_start,
    ).count()

    if upload_count >= 100:
        await send_admin_alert(
            "Unusual Upload Volume",
            f"{upload_count} file uploads in the last {ALERT_WINDOW} minutes.",
        )
