from datetime import datetime, timedelta
from app.models.broker import BrokerProfile
from app.models.match import Match
from app.models.complaint import Complaint
from app.models.property import Property


async def recalculate_broker_score(broker_id: str) -> float:
    """Recalculate dynamic trust score and availability for a broker."""
    broker = await BrokerProfile.find_one(BrokerProfile.user_id == broker_id)
    if not broker:
        return 0.0

    open_complaints = await Complaint.find(
        Complaint.against_user == broker_id,
        Complaint.status == "Open",
    ).count()

    closed_complaints = await Complaint.find(
        Complaint.against_user == broker_id,
        Complaint.status == "Resolved",
    ).count()

    score = 100.0
    score -= open_complaints * 5.0
    score -= closed_complaints * 2.0
    score += broker.successful_connections * 2.0

    if broker.response_rate > 0.8:
        score += 10.0
    elif broker.response_rate > 0.5:
        score += 5.0

    broker.trust_score = max(0.0, min(100.0, score))

    props = await Property.find(
        Property.broker_id == broker_id,
        Property.status == "Verified",
    ).count()
    broker.listings_count = props

    # Compute availability based on activity
    now = datetime.utcnow()
    fourteen_days_ago = now - timedelta(days=14)
    seven_days_ago = now - timedelta(days=7)

    if broker.last_seen is None or broker.last_seen < fourteen_days_ago:
        broker.availability = "Inactive"
    elif broker.response_rate < 0.5 or open_complaints > 0:
        broker.availability = "Busy"
    elif broker.listings_count > 0 and broker.last_seen >= seven_days_ago:
        broker.availability = "Available"
    else:
        broker.availability = "Inactive"

    await broker.save()
    return broker.trust_score
