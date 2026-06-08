from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.core.deps import get_current_user
from app.models.user import User
from app.models.complaint import Complaint
from datetime import datetime

router = APIRouter(prefix="/complaints", tags=["complaints"])


class ComplaintCreate(BaseModel):
    against_user: str
    match_id: Optional[str] = None
    reason: str
    description: str = ""


class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    resolution: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED)
async def file_complaint(data: ComplaintCreate, user: User = Depends(get_current_user)):
    complaint = Complaint(
        filed_by=str(user.id),
        against_user=data.against_user,
        match_id=data.match_id,
        reason=data.reason,
        description=data.description,
        status="Open",
        created_at=datetime.utcnow(),
    )
    await complaint.insert()

    from app.middleware.audit import log_audit

    await log_audit(
        user_id=str(user.id),
        action="complaint_filed",
        resource="complaints",
        details={"complaint_id": str(complaint.id), "against": data.against_user, "reason": data.reason},
    )

    return {
        "id": str(complaint.id),
        "status": complaint.status,
        "message": "Complaint filed successfully",
    }


@router.get("")
async def list_my_complaints(user: User = Depends(get_current_user)):
    complaints = await Complaint.find(Complaint.filed_by == str(user.id)).to_list()
    return [
        {
            "id": str(c.id),
            "against_user": c.against_user,
            "match_id": c.match_id,
            "reason": c.reason,
            "description": c.description,
            "status": c.status,
            "resolution": c.resolution,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in complaints
    ]


@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str, user: User = Depends(get_current_user)):
    c = await Complaint.get(complaint_id)
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if c.filed_by != str(user.id) and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "id": str(c.id),
        "filed_by": c.filed_by,
        "against_user": c.against_user,
        "match_id": c.match_id,
        "reason": c.reason,
        "description": c.description,
        "status": c.status,
        "resolution": c.resolution,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }
