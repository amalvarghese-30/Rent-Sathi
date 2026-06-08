from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_current_user
from app.models.user import User
from app.models.requirement import Requirement
from app.schemas.requirement import RequirementCreate, RequirementUpdate, RequirementResponse
from datetime import datetime
from uuid import uuid4
from beanie.odm.operators.find.comparison import In

router = APIRouter(prefix="/requirements", tags=["requirements"])


@router.post("", response_model=RequirementResponse, status_code=status.HTTP_201_CREATED)
async def create_requirement(data: RequirementCreate, user: User = Depends(get_current_user)):
    # Duplicate detection: same user, same area, same city, same property_type, active/draft
    existing = await Requirement.find_one(
        Requirement.user_id == str(user.id),
        Requirement.area == data.area,
        Requirement.city == data.city,
        Requirement.property_type == data.property_type,
        In(Requirement.status, ["Draft", "Active", "Matched"]),
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"A similar requirement for {data.area}, {data.city} already exists (status: {existing.status})",
        )

    req = Requirement(
        user_id=str(user.id),
        area=data.area,
        city=data.city,
        property_type=data.property_type,
        budget_min=data.budget_min,
        budget_max=data.budget_max,
        move_in_date=data.move_in_date,
        tenant_type=data.tenant_type,
        amenities=data.amenities,
        status="draft",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    await req.insert()

    return RequirementResponse(
        id=str(req.id),
        user_id=req.user_id,
        area=req.area,
        city=req.city,
        property_type=req.property_type,
        budget_min=req.budget_min,
        budget_max=req.budget_max,
        move_in_date=req.move_in_date,
        tenant_type=req.tenant_type,
        amenities=req.amenities,
        status=req.status,
        created_at=req.created_at,
        updated_at=req.updated_at,
    )


@router.get("", response_model=list[RequirementResponse])
async def list_requirements(user: User = Depends(get_current_user)):
    reqs = await Requirement.find(Requirement.user_id == str(user.id)).to_list()
    return [
        RequirementResponse(
            id=str(r.id),
            user_id=r.user_id,
            area=r.area,
            city=r.city,
            property_type=r.property_type,
            budget_min=r.budget_min,
            budget_max=r.budget_max,
            move_in_date=r.move_in_date,
            tenant_type=r.tenant_type,
            amenities=r.amenities,
            status=r.status,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
        for r in reqs
    ]


@router.get("/{requirement_id}", response_model=RequirementResponse)
async def get_requirement(requirement_id: str, user: User = Depends(get_current_user)):
    req = await Requirement.get(requirement_id)
    if not req or req.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Requirement not found")

    return RequirementResponse(
        id=str(req.id),
        user_id=req.user_id,
        area=req.area,
        city=req.city,
        property_type=req.property_type,
        budget_min=req.budget_min,
        budget_max=req.budget_max,
        move_in_date=req.move_in_date,
        tenant_type=req.tenant_type,
        amenities=req.amenities,
        status=req.status,
        created_at=req.created_at,
        updated_at=req.updated_at,
    )


@router.patch("/{requirement_id}", response_model=RequirementResponse)
async def update_requirement(requirement_id: str, data: RequirementUpdate, user: User = Depends(get_current_user)):
    req = await Requirement.get(requirement_id)
    if not req or req.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Requirement not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(req, key, value)
    req.updated_at = datetime.utcnow()
    await req.save()

    return RequirementResponse(
        id=str(req.id),
        user_id=req.user_id,
        area=req.area,
        city=req.city,
        property_type=req.property_type,
        budget_min=req.budget_min,
        budget_max=req.budget_max,
        move_in_date=req.move_in_date,
        tenant_type=req.tenant_type,
        amenities=req.amenities,
        status=req.status,
        created_at=req.created_at,
        updated_at=req.updated_at,
    )


@router.delete("/{requirement_id}")
async def delete_requirement(requirement_id: str, user: User = Depends(get_current_user)):
    req = await Requirement.get(requirement_id)
    if not req or req.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Requirement not found")
    await req.delete()
    return {"message": "Requirement deleted"}
