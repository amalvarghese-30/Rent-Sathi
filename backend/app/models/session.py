from datetime import datetime
from beanie import Document
from pydantic import Field


class Session(Document):
    user_id: str
    token_hash: str  # hashed refresh token
    device: str = ""  # parsed from user-agent
    browser: str = ""
    os: str = ""
    ip_address: str = ""
    location: str = ""  # city, country
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "sessions"
