from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.models.audit import AuditLog
from datetime import datetime
import json
import time


_last_alert_check = 0
_ALERT_CHECK_INTERVAL = 300  # seconds (5 minutes)


async def log_audit(user_id: str | None, action: str, resource: str, details: dict, request: Request):
    audit = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        details=details,
        ip_address=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
        timestamp=datetime.utcnow(),
    )
    await audit.insert()

    # Debounced anomaly detection
    global _last_alert_check
    now = time.time()
    if now - _last_alert_check > _ALERT_CHECK_INTERVAL:
        _last_alert_check = now
        try:
            from app.services.audit_alerts import check_alerts
            await check_alerts()
        except Exception:
            pass


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PATCH", "PUT", "DELETE"):
            path = request.url.path
            parts = path.split("/")

            resource = "unknown"
            if "auth" in parts:
                resource = "auth"
            elif "requirements" in parts:
                resource = "requirements"
            elif "properties" in parts:
                resource = "properties"
            elif "matches" in parts:
                resource = "matches"
            elif "admin" in parts:
                resource = "admin"
            elif "complaints" in parts:
                resource = "complaints"
            elif "uploads" in parts:
                resource = "uploads"

            details = {
                "method": request.method,
                "path": path,
                "query": str(request.query_params),
            }

            try:
                body = await request.body()
                if body:
                    body_str = body.decode()[:500]
                    try:
                        body_json = json.loads(body_str)
                        if "password" in body_json:
                            body_json["password"] = "***REDACTED***"
                        if "new_password" in body_json:
                            body_json["new_password"] = "***REDACTED***"
                        details["body"] = json.dumps(body_json)
                    except json.JSONDecodeError:
                        details["body"] = body_str[:200]
            except Exception:
                pass

            user_id = None
            token = request.cookies.get("access_token")
            if token:
                from app.core.security import decode_token
                payload = decode_token(token)
                user_id = payload.get("sub")

            try:
                await log_audit(
                    user_id=user_id,
                    action=request.method,
                    resource=resource,
                    details=details,
                    request=request,
                )
            except Exception:
                pass

        response = await call_next(request)
        return response
