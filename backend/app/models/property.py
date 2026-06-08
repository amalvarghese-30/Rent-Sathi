from datetime import datetime
from typing import List
from beanie import Document
from pydantic import Field


class Property(Document):
    broker_id: str
    title: str
    description: str = ""
    area: str
    city: str
    rent: float
    deposit: float = 0.0
    property_type: str
    amenities: List[str] = Field(default_factory=list)
    photos: List[str] = Field(default_factory=list)
    status: str = "Draft"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "properties"
