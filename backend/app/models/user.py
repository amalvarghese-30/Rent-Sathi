from datetime import datetime
from typing import Optional, Literal
from beanie import Document, Indexed
from pydantic import Field


class User(Document):
    email: Indexed(str, unique=True)
    password_hash: str
    full_name: str
    phone: str
    role: Literal["renter", "broker", "admin"] = "renter"
    is_verified: bool = False
    verification_badge: Optional[str] = None
    refresh_token_hash: Optional[str] = None
    locked_until: Optional[datetime] = None
    failed_login_attempts: int = 0
    token_invalidated_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
