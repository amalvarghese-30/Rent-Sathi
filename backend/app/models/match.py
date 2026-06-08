from datetime import datetime
from typing import Optional, Dict
from beanie import Document
from pydantic import Field


class Match(Document):
    requirement_id: str
    property_id: str
    score_breakdown: Dict[str, int] = Field(default_factory=dict)
    status: str = "Created"
    admin_approved: bool = False
    approved_by: str = ""  # admin user ID who approved
    user_approved: Optional[bool] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "matches"
