from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_current_user
from app.models.user import User
from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse
from datetime import datetime

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(data: PropertyCreate, user: User = Depends(get_current_user)):
    if user.role not in ("broker", "admin"):
        raise HTTPException(status_code=403, detail="Only brokers can create properties")

    prop = Property(
        broker_id=str(user.id),
        title=data.title,
        description=data.description,
        area=data.area,
        city=data.city,
        rent=data.rent,
        deposit=data.deposit,
        property_type=data.property_type,
        amenities=data.amenities,
        photos=[],
        status="Pending Verification",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    await prop.insert()

    return PropertyResponse(
        id=str(prop.id),
        broker_id=prop.broker_id,
        title=prop.title,
        description=prop.description,
        area=prop.area,
        city=prop.city,
        rent=prop.rent,
        deposit=prop.deposit,
        property_type=prop.property_type,
        amenities=prop.amenities,
        photos=prop.photos,
        status=prop.status,
        created_at=prop.created_at,
        updated_at=prop.updated_at,
    )


@router.get("", response_model=list[PropertyResponse])
async def list_properties(user: User = Depends(get_current_user)):
    if user.role in ("broker", "admin"):
        props = await Property.find(Property.broker_id == str(user.id)).to_list()
    else:
        props = await Property.find(Property.status == "Verified").to_list()

    return [
        PropertyResponse(
            id=str(p.id),
            broker_id=p.broker_id,
            title=p.title,
            description=p.description,
            area=p.area,
            city=p.city,
            rent=p.rent,
            deposit=p.deposit,
            property_type=p.property_type,
            amenities=p.amenities,
            photos=p.photos,
            status=p.status,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )
        for p in props
    ]


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: str, user: User = Depends(get_current_user)):
    prop = await Property.get(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if prop.broker_id != str(user.id) and prop.status != "Verified":
        raise HTTPException(status_code=404, detail="Property not found")

    return PropertyResponse(
        id=str(prop.id),
        broker_id=prop.broker_id,
        title=prop.title,
        description=prop.description,
        area=prop.area,
        city=prop.city,
        rent=prop.rent,
        deposit=prop.deposit,
        property_type=prop.property_type,
        amenities=prop.amenities,
        photos=prop.photos,
        status=prop.status,
        created_at=prop.created_at,
        updated_at=prop.updated_at,
    )


@router.patch("/{property_id}", response_model=PropertyResponse)
async def update_property(property_id: str, data: PropertyUpdate, user: User = Depends(get_current_user)):
    prop = await Property.get(property_id)
    if not prop or prop.broker_id != str(user.id):
        raise HTTPException(status_code=404, detail="Property not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prop, key, value)
    prop.updated_at = datetime.utcnow()
    await prop.save()

    return PropertyResponse(
        id=str(prop.id),
        broker_id=prop.broker_id,
        title=prop.title,
        description=prop.description,
        area=prop.area,
        city=prop.city,
        rent=prop.rent,
        deposit=prop.deposit,
        property_type=prop.property_type,
        amenities=prop.amenities,
        photos=prop.photos,
        status=prop.status,
        created_at=prop.created_at,
        updated_at=prop.updated_at,
    )


@router.delete("/{property_id}")
async def delete_property(property_id: str, user: User = Depends(get_current_user)):
    prop = await Property.get(property_id)
    if not prop or prop.broker_id != str(user.id):
        raise HTTPException(status_code=404, detail="Property not found")
    await prop.delete()
    return {"message": "Property deleted"}
