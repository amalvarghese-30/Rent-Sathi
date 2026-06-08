from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict


class MatchResponse(BaseModel):
    id: str
    requirement_id: str
    property_id: str
    score_breakdown: Dict[str, int]
    status: str
    admin_approved: bool
    user_approved: Optional[bool] = None
    created_at: datetime
