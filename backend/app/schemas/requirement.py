from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List


class RequirementCreate(BaseModel):
    area: str
    city: str
    property_type: str
    budget_min: float
    budget_max: float
    move_in: Optional[date] = None
    move_in_date: Optional[date] = None
    tenant_type: str = ""
    amenities: List[str] = Field(default_factory=list)

    def model_post_init(self, __context):
        # Accept both "move_in" (frontend) and "move_in_date" (legacy)
        if self.move_in and not self.move_in_date:
            self.move_in_date = self.move_in


class RequirementUpdate(BaseModel):
    area: Optional[str] = None
    city: Optional[str] = None
    property_type: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    move_in_date: Optional[date] = None
    tenant_type: Optional[str] = None
    amenities: Optional[List[str]] = None
    status: Optional[str] = None


class RequirementResponse(BaseModel):
    id: str
    user_id: str
    area: str
    city: str
    property_type: str
    budget_min: float
    budget_max: float
    move_in: Optional[date] = None
    move_in_date: Optional[date] = None
    tenant_type: str
    amenities: List[str]
    status: str
    created_at: datetime
    updated_at: datetime

    def model_post_init(self, __context):
        if self.move_in_date and not self.move_in:
            self.move_in = self.move_in_date
        elif self.move_in and not self.move_in_date:
            self.move_in_date = self.move_in
