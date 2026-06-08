from datetime import datetime
from beanie import Document
from pydantic import Field


class ContactLedger(Document):
    """Immutable record of every contact reveal between renter and broker."""
    match_id: str
    requirement_id: str
    property_id: str
    renter_id: str
    broker_id: str
    admin_id: str = ""  # admin who approved
    shared_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "contact_ledger"
