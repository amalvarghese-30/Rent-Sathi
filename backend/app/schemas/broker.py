from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class BrokerRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str
    agency_name: str = ""
    license_number: str = ""
    rera_id: str = ""


class BrokerResponse(BaseModel):
    id: str
    user_id: str
    agency_name: str
    license_number: str
    rera_id: str
    trust_score: float
    response_rate: float
    verification_status: str
    availability: str
    last_seen: Optional[datetime] = None
    documents: List[dict]
    listings_count: int
    successful_connections: int


class BrokerVerifyRequest(BaseModel):
    status: str  # "verified" or "rejected"
    reason: Optional[str] = None
    password: Optional[str] = None  # re-auth for destructive actions
