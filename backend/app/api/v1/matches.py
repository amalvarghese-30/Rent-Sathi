from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.match import Match
from app.models.requirement import Requirement
from app.models.property import Property
from app.models.notification import Notification
from app.models.contact_ledger import ContactLedger
from app.models.broker import BrokerProfile
from app.schemas.match import MatchResponse
from app.services.matching import score_match
from app.services.broker_reputation import recalculate_broker_score
from datetime import datetime

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("")
async def list_matches(user: User = Depends(get_current_user)):
    matches = await Match.find().to_list()

    results = []
    for m in matches:
        req = await Requirement.get(m.requirement_id) if m.requirement_id else None
        if user.role == "renter" and req and req.user_id != str(user.id):
            continue
        prop = await Property.get(m.property_id) if m.property_id else None
        if user.role == "broker":
            if prop and prop.broker_id != str(user.id):
                continue
        broker_user = await User.get(prop.broker_id) if prop else None
        broker_name = broker_user.full_name if broker_user else ""
        results.append({
            "id": str(m.id),
            "requirement_id": m.requirement_id,
            "property_id": m.property_id,
            "score_breakdown": m.score_breakdown,
            "status": m.status,
            "admin_approved": m.admin_approved,
            "user_approved": m.user_approved,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "requirement_area": req.area if req else "",
            "property_title": prop.title if prop else "",
            "property_rent": prop.rent if prop else 0,
            "property_type": prop.property_type if prop else "",
            "broker_name": broker_name,
        })
    return results


@router.post("/scan/{requirement_id}")
async def scan_matches(requirement_id: str, user: User = Depends(get_current_user)):
    req = await Requirement.get(requirement_id)
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    if req.user_id != str(user.id) and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    req.status = "Matching"
    await req.save()

    properties = await Property.find(Property.status == "Verified").to_list()
    if not properties:
        req.status = "Active"
        await req.save()
        return {"matches_created": 0, "message": "No verified properties available"}

    req_dict = {
        "area": req.area,
        "budget_min": req.budget_min,
        "budget_max": req.budget_max,
        "property_type": req.property_type,
        "amenities": req.amenities,
    }

    created = []
    for prop in properties:
        prop_dict = {
            "area": prop.area,
            "rent": prop.rent,
            "property_type": prop.property_type,
            "amenities": prop.amenities,
        }
        scores = score_match(req_dict, prop_dict)
        if scores["total"] >= 60:
            existing = await Match.find_one(
                Match.requirement_id == requirement_id,
                Match.property_id == str(prop.id),
            )
            if not existing:
                match = Match(
                    requirement_id=requirement_id,
                    property_id=str(prop.id),
                    score_breakdown={
                        "location": scores["location"],
                        "budget": scores["budget"],
                        "property": scores["property"],
                        "amenities": scores["amenities"],
                        "total": scores["total"],
                    },
                    status="Pending Admin",
                    admin_approved=False,
                    created_at=datetime.utcnow(),
                )
                await match.insert()
                created.append(str(match.id))

    req.status = "Matched" if created else "Active"
    await req.save()

    if created:
        from app.api.v1.notifications import create_notification
        admins = await User.find(User.role == "admin").to_list()
        for admin in admins:
            await create_notification(
                user_id=str(admin.id),
                title="New Matches Require Review",
                body=f"{len(created)} matches created for requirement in {req.area}, {req.city}",
                category="match",
                action_url="/admin/matches",
            )

    return {"matches_created": len(created), "match_ids": created}


@router.get("/{match_id}")
async def get_match(match_id: str, user: User = Depends(get_current_user)):
    m = await Match.get(match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")

    req = await Requirement.get(m.requirement_id) if m.requirement_id else None
    prop = await Property.get(m.property_id) if m.property_id else None
    broker = await BrokerProfile.find_one(BrokerProfile.user_id == prop.broker_id) if prop else None
    broker_user = await User.get(prop.broker_id) if prop else None

    return {
        "id": str(m.id),
        "requirement_id": m.requirement_id,
        "property_id": m.property_id,
        "score_breakdown": m.score_breakdown,
        "status": m.status,
        "admin_approved": m.admin_approved,
        "user_approved": m.user_approved,
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "requirement_area": req.area if req else "",
        "property_title": prop.title if prop else "",
        "property_area": prop.area if prop else "",
        "property_rent": prop.rent if prop else 0,
        "property_deposit": prop.deposit if prop else 0,
        "property_type": prop.property_type if prop else "",
        "property_available": "",
        "property_description": prop.description if prop else "",
        "broker_name": broker_user.full_name if broker_user else "",
    }


@router.patch("/{match_id}/approve")
async def approve_match(match_id: str, user: User = Depends(get_current_user)):
    m = await Match.get(match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")

    m.user_approved = True
    if m.admin_approved:
        m.status = "Approved"
        # Write to contact ledger when both parties approved
        existing = await ContactLedger.find_one(ContactLedger.match_id == match_id)
        if not existing:
            req = await Requirement.get(m.requirement_id) if m.requirement_id else None
            prop = await Property.get(m.property_id) if m.property_id else None
            if req and prop:
                ledger = ContactLedger(
                    match_id=match_id,
                    requirement_id=m.requirement_id,
                    property_id=m.property_id,
                    renter_id=req.user_id,
                    broker_id=prop.broker_id,
                    admin_id=m.approved_by or "",
                    shared_at=datetime.utcnow(),
                )
                await ledger.insert()

                # Increment broker's successful connections
                broker = await BrokerProfile.find_one(BrokerProfile.user_id == prop.broker_id)
                if broker:
                    broker.successful_connections += 1
                    await broker.save()
                    await recalculate_broker_score(prop.broker_id)
    else:
        m.status = "Pending Admin"
    await m.save()

    from app.api.v1.notifications import create_notification
    prop = await Property.get(m.property_id) if m.property_id else None
    if prop:
        await create_notification(
            user_id=prop.broker_id,
            title="Renter Approved Your Match",
            body=f"Your property '{prop.title}' match has been approved by the renter",
            category="match",
            action_url=f"/matches/{match_id}",
        )

    return {"status": m.status}


@router.patch("/{match_id}/decline")
async def decline_match(match_id: str, user: User = Depends(get_current_user)):
    m = await Match.get(match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")

    m.user_approved = False
    m.status = "Rejected"
    await m.save()
    return {"status": "declined"}
