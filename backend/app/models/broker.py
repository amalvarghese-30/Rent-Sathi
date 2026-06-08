from typing import Optional, Literal, List
from datetime import datetime
from beanie import Document
from pydantic import Field


class BrokerProfile(Document):
    user_id: str
    agency_name: str = ""
    license_number: str = ""
    rera_id: str = ""
    trust_score: float = 0.0
    response_rate: float = 0.0
    verification_status: Literal["pending", "verified", "rejected"] = "pending"
    availability: Literal["Available", "Busy", "Inactive"] = "Inactive"
    last_seen: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    documents: List[dict] = Field(default_factory=list)
    listings_count: int = 0
    successful_connections: int = 0

    class Settings:
        name = "broker_profiles"
