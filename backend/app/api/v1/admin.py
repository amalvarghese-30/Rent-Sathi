from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.config import settings
from app.core.deps import get_current_admin
from app.core.security import verify_password
from app.models.user import User
from app.models.broker import BrokerProfile
from app.models.property import Property
from app.models.match import Match
from app.models.complaint import Complaint
from app.models.audit import AuditLog
from app.models.requirement import Requirement
from app.models.contact_ledger import ContactLedger
from app.schemas.broker import BrokerResponse, BrokerVerifyRequest
from app.services.broker_reputation import recalculate_broker_score
from beanie.odm.operators.find.comparison import In
from datetime import datetime, timedelta


class AdminConfirmRequest(BaseModel):
    password: str
    action: str  # descriptive: "reject broker", "delete property", etc.

class AdminPasswordMixin(BaseModel):
    password: str | None = None  # optional re-auth for destructive endpoints

router = APIRouter(prefix="/admin", tags=["admin"])


async def _safe_get_user(user_identifier: str):
    """Look up user by ID or email (complaints store against_user as email)."""
    if not user_identifier:
        return None
    from beanie import PydanticObjectId
    try:
        return await User.get(PydanticObjectId(user_identifier))
    except Exception:
        return await User.find_one(User.email == user_identifier)


# ── Admin Re-Auth (required before destructive actions) ───────────

@router.post("/confirm-action")
async def confirm_action(data: AdminConfirmRequest, admin: User = Depends(get_current_admin)):
    if settings.environment == "production" and not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    from app.middleware.audit import log_audit
    return {"confirmed": True, "action": data.action}


# ── Dashboard Stats ──────────────────────────────────────────────

@router.get("/stats")
async def admin_stats(admin: User = Depends(get_current_admin)):
    pending_brokers = await BrokerProfile.find(BrokerProfile.verification_status == "pending").count()
    pending_properties = await Property.find(Property.status == "Pending Verification").count()
    pending_matches = await Match.find(Match.admin_approved == False).count()
    open_complaints = await Complaint.find(Complaint.status == "Open").count()
    total_users = await User.find().count()
    total_brokers = await User.find(User.role == "broker").count()
    total_renters = await User.find(User.role == "renter").count()

    return {
        "pending_brokers": pending_brokers,
        "pending_properties": pending_properties,
        "pending_matches": pending_matches,
        "open_complaints": open_complaints,
        "total_users": total_users,
        "total_brokers": total_brokers,
        "total_renters": total_renters,
    }


# ── Broker Verification ──────────────────────────────────────────

@router.get("/brokers/pending")
async def list_pending_brokers(admin: User = Depends(get_current_admin)):
    brokers = await BrokerProfile.find(
        BrokerProfile.verification_status == "pending"
    ).to_list()

    results = []
    for b in brokers:
        user = await User.get(b.user_id)
        results.append({
            "id": str(b.id),
            "user_id": b.user_id,
            "agency_name": b.agency_name,
            "license_number": b.license_number,
            "rera_id": b.rera_id,
            "trust_score": b.trust_score,
            "verification_status": b.verification_status,
            "documents": b.documents,
            "user": {
                "id": str(user.id) if user else "",
                "email": user.email if user else "",
                "full_name": user.full_name if user else "",
                "phone": user.phone if user else "",
            } if user else None,
        })
    return results


@router.get("/brokers/{broker_id}")
async def get_broker_detail(broker_id: str, admin: User = Depends(get_current_admin)):
    broker = await BrokerProfile.get(broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")

    user = await User.get(broker.user_id)
    properties = await Property.find(Property.broker_id == broker.user_id).to_list()

    return {
        "id": str(broker.id),
        "user_id": broker.user_id,
        "agency_name": broker.agency_name,
        "license_number": broker.license_number,
        "rera_id": broker.rera_id,
        "trust_score": broker.trust_score,
        "response_rate": broker.response_rate,
        "verification_status": broker.verification_status,
        "documents": broker.documents,
        "listings_count": broker.listings_count,
        "successful_connections": broker.successful_connections,
        "user": {
            "id": str(user.id) if user else "",
            "email": user.email if user else "",
            "full_name": user.full_name if user else "",
            "phone": user.phone if user else "",
        } if user else None,
        "properties": [{"id": str(p.id), "title": p.title, "status": p.status} for p in properties],
    }


@router.post("/brokers/{broker_id}/verify")
async def verify_broker(broker_id: str, data: BrokerVerifyRequest, admin: User = Depends(get_current_admin)):
    broker = await BrokerProfile.get(broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")

    broker.verification_status = data.status  # "verified"
    await broker.save()

    if data.status == "verified":
        broker.verified_at = datetime.utcnow()
        await broker.save()
        user = await User.get(broker.user_id)
        if user:
            user.is_verified = True
            user.verification_badge = "verified_broker"
            await user.save()
        from app.services.email import send_broker_verified_email
        await send_broker_verified_email(user.email, user.full_name)

    await recalculate_broker_score(broker.user_id)
    return {"message": f"Broker {data.status}", "broker_id": broker_id}


@router.post("/brokers/{broker_id}/reject")
async def reject_broker(broker_id: str, data: BrokerVerifyRequest, admin: User = Depends(get_current_admin)):
    if settings.environment == "production" and data.password and not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    broker = await BrokerProfile.get(broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")

    broker.verification_status = "rejected"
    await broker.save()

    await recalculate_broker_score(broker.user_id)
    return {"message": "Broker rejected", "reason": data.reason}


# ── Property Verification ────────────────────────────────────────

@router.get("/properties/pending")
async def list_pending_properties(admin: User = Depends(get_current_admin)):
    props = await Property.find(Property.status == "Pending Verification").to_list()
    results = []
    for p in props:
        broker = await User.get(p.broker_id)
        results.append({
            "id": str(p.id),
            "broker_id": p.broker_id,
            "title": p.title,
            "description": p.description,
            "area": p.area,
            "city": p.city,
            "rent": p.rent,
            "deposit": p.deposit,
            "property_type": p.property_type,
            "amenities": p.amenities,
            "photos": p.photos,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "broker_name": broker.full_name if broker else "",
        })
    return results


@router.get("/properties/{property_id}")
async def get_property_detail(property_id: str, admin: User = Depends(get_current_admin)):
    prop = await Property.get(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    broker = await User.get(prop.broker_id)
    return {
        "id": str(prop.id),
        "broker_id": prop.broker_id,
        "title": prop.title,
        "description": prop.description,
        "area": prop.area,
        "city": prop.city,
        "rent": prop.rent,
        "deposit": prop.deposit,
        "property_type": prop.property_type,
        "amenities": prop.amenities,
        "photos": prop.photos,
        "status": prop.status,
        "broker_name": broker.full_name if broker else "",
        "created_at": prop.created_at.isoformat() if prop.created_at else None,
    }


@router.post("/properties/{property_id}/verify")
async def verify_property(property_id: str, admin: User = Depends(get_current_admin)):
    prop = await Property.get(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    prop.status = "Verified"
    await prop.save()

    broker = await BrokerProfile.find_one(BrokerProfile.user_id == prop.broker_id)
    if broker:
        broker.listings_count += 1
        await broker.save()

    return {"message": "Property verified", "property_id": property_id}


@router.post("/properties/{property_id}/reject")
async def reject_property(property_id: str, data: AdminPasswordMixin, admin: User = Depends(get_current_admin)):
    if settings.environment == "production" and data.password and not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    prop = await Property.get(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    prop.status = "Rejected"
    await prop.save()
    return {"message": "Property rejected", "property_id": property_id}


@router.delete("/properties/{property_id}")
async def delete_property(property_id: str, data: AdminPasswordMixin, admin: User = Depends(get_current_admin)):
    if settings.environment == "production" and data.password and not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    prop = await Property.get(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    await prop.delete()

    # Update broker listing count
    broker = await BrokerProfile.find_one(BrokerProfile.user_id == prop.broker_id)
    if broker and broker.listings_count > 0:
        broker.listings_count -= 1
        await broker.save()

    return {"message": "Property deleted", "property_id": property_id}


# ── Match Management ─────────────────────────────────────────────

@router.get("/matches/pending")
async def list_pending_matches(admin: User = Depends(get_current_admin)):
    matches = await Match.find(Match.admin_approved == False).to_list()
    results = []
    for m in matches:
        req = await Requirement.get(m.requirement_id)
        prop = await Property.get(m.property_id)
        renter = await User.get(req.user_id) if req else None
        broker = await User.get(prop.broker_id) if prop else None
        broker_profile = await BrokerProfile.find_one(BrokerProfile.user_id == prop.broker_id) if prop else None
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
            # Renter / requirement detail
            "renter": {
                "id": str(renter.id) if renter else "",
                "full_name": renter.full_name if renter else "",
                "email": renter.email if renter else "",
                "phone": renter.phone if renter else "",
            } if renter else None,
            "requirement": {
                "area": req.area if req else "",
                "city": req.city if req else "",
                "property_type": req.property_type if req else "",
                "budget_min": req.budget_min if req else 0,
                "budget_max": req.budget_max if req else 0,
                "tenant_type": req.tenant_type if req else "",
                "amenities": req.amenities if req else [],
                "status": req.status if req else "",
                "move_in_date": req.move_in_date.isoformat() if req and req.move_in_date else None,
            } if req else None,
            # Broker detail
            "broker": {
                "id": str(broker.id) if broker else "",
                "full_name": broker.full_name if broker else "",
                "agency_name": broker_profile.agency_name if broker_profile else "",
                "trust_score": broker_profile.trust_score if broker_profile else 0,
            } if broker else None,
        })
    return results


@router.post("/matches/{match_id}/approve")
async def admin_approve_match(match_id: str, admin: User = Depends(get_current_admin)):
    m = await Match.get(match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")

    m.admin_approved = True
    m.approved_by = str(admin.id)
    m.status = "Pending User"
    await m.save()

    # Notify the renter that admin approved their match
    from app.api.v1.notifications import create_notification
    req = await Requirement.get(m.requirement_id) if m.requirement_id else None
    prop = await Property.get(m.property_id) if m.property_id else None
    if req:
        await create_notification(
            user_id=req.user_id,
            title="Match Approved by Admin",
            body=f"Your match for {req.area}, {req.city} has been approved by admin. Review and confirm.",
            category="match",
            action_url="/matches",
        )
    if prop:
        await create_notification(
            user_id=prop.broker_id,
            title="Match Approved by Admin",
            body=f"Your property '{prop.title}' match has been approved by admin. Awaiting renter confirmation.",
            category="match",
            action_url="/broker",
        )

    # If both admin and user approved, record in contact ledger
    if m.user_approved:
        m.status = "Approved"
        await m.save()
        existing = await ContactLedger.find_one(ContactLedger.match_id == match_id)
        if not existing:
            req = await Requirement.find_one(Requirement.id == m.requirement_id) if m.requirement_id else None
            prop = await Property.find_one(Property.id == m.property_id) if m.property_id else None
            if req and prop:
                ledger = ContactLedger(
                    match_id=match_id,
                    requirement_id=m.requirement_id,
                    property_id=m.property_id,
                    renter_id=req.user_id,
                    broker_id=prop.broker_id,
                    admin_id=str(admin.id),
                    shared_at=datetime.utcnow(),
                )
                await ledger.insert()

    return {"message": "Match approved", "match_id": match_id}


@router.post("/matches/{match_id}/reject")
async def admin_reject_match(match_id: str, data: AdminPasswordMixin, admin: User = Depends(get_current_admin)):
    if settings.environment == "production" and data.password and not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    m = await Match.get(match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")

    m.status = "Rejected"
    m.admin_approved = False
    await m.save()

    # Notify the renter that admin rejected their match
    from app.api.v1.notifications import create_notification
    req = await Requirement.get(m.requirement_id) if m.requirement_id else None
    prop = await Property.get(m.property_id) if m.property_id else None
    if req:
        await create_notification(
            user_id=req.user_id,
            title="Match Not Approved",
            body=f"Your match for {req.area}, {req.city} was not approved by admin.",
            category="match",
            action_url="/matches",
        )

    return {"message": "Match rejected", "match_id": match_id}


# ── Property Expiry Check ────────────────────────────────────────

@router.post("/properties/check-expiry")
async def check_property_expiry(admin: User = Depends(get_current_admin)):
    """Mark properties older than 90 days as inactive."""
    cutoff = datetime.utcnow() - timedelta(days=90)
    expired = await Property.find(
        Property.status == "Verified",
        Property.created_at <= cutoff,
    ).to_list()

    count = 0
    for p in expired:
        p.status = "Inactive"
        await p.save()
        count += 1

    return {"expired_count": count, "cutoff_date": cutoff.isoformat()}


# ── Complaints ───────────────────────────────────────────────────

@router.get("/complaints")
async def list_complaints(admin: User = Depends(get_current_admin)):
    complaints = await Complaint.find().to_list()
    results = []
    for c in complaints:
        filed_by = await _safe_get_user(c.filed_by)
        against = await _safe_get_user(c.against_user)
        results.append({
            "id": str(c.id),
            "filed_by": c.filed_by,
            "against_user": c.against_user,
            "match_id": c.match_id,
            "reason": c.reason,
            "description": c.description,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "filed_by_name": filed_by.full_name if filed_by else "",
            "against_name": against.full_name if against else "",
        })
    return results


@router.get("/complaints/{complaint_id}")
async def get_complaint_detail(complaint_id: str, admin: User = Depends(get_current_admin)):
    c = await Complaint.get(complaint_id)
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    filed_by = await _safe_get_user(c.filed_by)
    against = await _safe_get_user(c.against_user)
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
        "filed_by_name": filed_by.full_name if filed_by else "",
        "against_name": against.full_name if against else "",
    }


class ComplaintResolveRequest(BaseModel):
    resolution: str
    status: str = "Resolved"  # or "Dismissed"

@router.patch("/complaints/{complaint_id}/resolve")
async def resolve_complaint(complaint_id: str, data: ComplaintResolveRequest, admin: User = Depends(get_current_admin)):
    c = await Complaint.get(complaint_id)
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    c.status = data.status
    c.resolution = data.resolution
    await c.save()

    # Recalculate broker score when a complaint is resolved
    if c.against_user:
        await recalculate_broker_score(c.against_user)

    return {"message": f"Complaint {data.status.lower()}", "complaint_id": complaint_id}


# ── Ops Analytics ───────────────────────────────────────────────

@router.get("/ops")
async def ops_analytics(admin: User = Depends(get_current_admin)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    thirty_days_ago = today - timedelta(days=30)

    # Today's activity
    reqs_today = await Requirement.find(Requirement.created_at >= today).count()
    matches_today = await Match.find(Match.created_at >= today).count()
    brokers_verified_today = await BrokerProfile.find(
        BrokerProfile.verification_status == "verified",
        BrokerProfile.verified_at >= today,
    ).count()
    contacts_today = await ContactLedger.find(ContactLedger.shared_at >= today).count()
    verifications_pending = (
        await BrokerProfile.find(BrokerProfile.verification_status == "pending").count()
        + await Property.find(Property.status == "Pending Verification").count()
    )
    contact_approvals = await ContactLedger.find().count()
    total_contacts = await Match.find(In(Match.status, ["Approved", "Connected"])).count()
    contact_rate = round(contact_approvals / max(total_contacts, 1) * 100)

    # Top areas (last 7 days)
    reqs_recent = await Requirement.find(Requirement.created_at >= week_ago).to_list()
    area_counts: dict[str, dict] = {}
    for r in reqs_recent:
        key = f"{r.area}, {r.city}" if r.city else r.area
        if key not in area_counts:
            area_counts[key] = {"reqs": 0, "matched": 0}
        area_counts[key]["reqs"] += 1

    matches_recent = await Match.find(Match.created_at >= week_ago).to_list()
    for m in matches_recent:
        if m.requirement_id:
            req = await Requirement.get(m.requirement_id)
            if req:
                key = f"{req.area}, {req.city}" if req.city else req.area
                if key in area_counts:
                    area_counts[key]["matched"] += 1

    top_areas = sorted(area_counts.items(), key=lambda x: x[1]["reqs"], reverse=True)[:8]
    top_areas_data = [{"area": a, "reqs": d["reqs"], "matched": d["matched"]} for a, d in top_areas]

    # Budget distribution
    all_reqs = await Requirement.find().to_list()
    budget_buckets = [
        {"range": "₹8k – ₹15k", "min": 0, "max": 15000, "count": 0},
        {"range": "₹15k – ₹25k", "min": 15000, "max": 25000, "count": 0},
        {"range": "₹25k – ₹40k", "min": 25000, "max": 40000, "count": 0},
        {"range": "₹40k – ₹60k", "min": 40000, "max": 60000, "count": 0},
        {"range": "₹60k+", "min": 60000, "max": 999999999, "count": 0},
    ]
    for r in all_reqs:
        mid = (r.budget_min + r.budget_max) / 2 if r.budget_max else r.budget_min
        for bucket in budget_buckets:
            if bucket["min"] <= mid < bucket["max"]:
                bucket["count"] += 1
                break
    total_reqs = max(len(all_reqs), 1)
    budget_data = [{**b, "pct": round(b["count"] / total_reqs * 100)} for b in budget_buckets]

    # Funnel (last 30 days)
    reqs_30 = await Requirement.find(Requirement.created_at >= thirty_days_ago).count()
    matched_30 = await Match.find(Match.created_at >= thirty_days_ago).count()
    admin_approved_30 = await Match.find(
        Match.admin_approved == True, Match.created_at >= thirty_days_ago
    ).count()
    user_approved_30 = await Match.find(
        Match.user_approved == True, Match.created_at >= thirty_days_ago
    ).count()
    connected_30 = await ContactLedger.find(
        ContactLedger.shared_at >= thirty_days_ago
    ).count()

    top = max(reqs_30, 1)
    funnel = [
        {"label": "Requirements", "value": reqs_30, "pct": 100},
        {"label": "Matched", "value": matched_30, "pct": round(matched_30 / top * 100)},
        {"label": "Admin approved", "value": admin_approved_30, "pct": round(admin_approved_30 / top * 100)},
        {"label": "User approved", "value": user_approved_30, "pct": round(user_approved_30 / top * 100)},
        {"label": "Connected", "value": connected_30, "pct": round(connected_30 / top * 100)},
    ]

    return {
        "today": {
            "requirements": reqs_today,
            "matches": matches_today,
            "brokers_verified": brokers_verified_today,
            "contacts_shared": contacts_today,
            "verifications_pending": verifications_pending,
            "contact_approvals": contact_approvals,
            "contact_accept_rate": contact_rate,
        },
        "top_areas": top_areas_data,
        "budget_distribution": budget_data,
        "funnel": funnel,
    }


# ── Audit Logs ───────────────────────────────────────────────────

@router.get("/audit")
async def list_audit_logs(admin: User = Depends(get_current_admin), limit: int = 100, skip: int = 0):
    logs = await AuditLog.find().sort(-AuditLog.timestamp).skip(skip).limit(limit).to_list()
    return [
        {
            "id": str(l.id),
            "user_id": l.user_id,
            "action": l.action,
            "resource": l.resource,
            "details": l.details,
            "ip_address": l.ip_address,
            "user_agent": l.user_agent,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
        }
        for l in logs
    ]
