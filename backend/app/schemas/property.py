from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class PropertyCreate(BaseModel):
    title: str
    description: str = ""
    area: str
    city: str
    rent: float
    deposit: float = 0.0
    property_type: str
    amenities: List[str] = Field(default_factory=list)


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    rent: Optional[float] = None
    deposit: Optional[float] = None
    property_type: Optional[str] = None
    amenities: Optional[List[str]] = None
    status: Optional[str] = None


class PropertyResponse(BaseModel):
    id: str
    broker_id: str
    title: str
    description: str
    area: str
    city: str
    rent: float
    deposit: float
    property_type: str
    amenities: List[str]
    photos: List[str]
    status: str
    created_at: datetime
    updated_at: datetime
