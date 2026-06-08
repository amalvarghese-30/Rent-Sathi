from datetime import datetime, date
from typing import Optional, List
from beanie import Document
from pydantic import Field


class Requirement(Document):
    user_id: str
    area: str
    city: str
    property_type: str
    budget_min: float
    budget_max: float
    move_in_date: Optional[date] = None
    tenant_type: str = ""
    amenities: List[str] = Field(default_factory=list)
    status: str = "Draft"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "requirements"
