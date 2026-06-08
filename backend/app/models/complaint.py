from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field


class Complaint(Document):
    filed_by: str
    against_user: str
    match_id: Optional[str] = None
    reason: str
    description: str = ""
    status: str = "Open"
    resolution: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "complaints"
