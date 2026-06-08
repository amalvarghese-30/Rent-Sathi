from datetime import datetime
from typing import Optional, Dict
from beanie import Document
from pydantic import Field


class AuditLog(Document):
    user_id: Optional[str] = None
    action: str
    resource: str
    details: Dict = Field(default_factory=dict)
    ip_address: str = ""
    user_agent: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "audit_logs"
