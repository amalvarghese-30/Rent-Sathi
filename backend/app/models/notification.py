from datetime import datetime
from beanie import Document
from pydantic import Field


class Notification(Document):
    user_id: str
    title: str
    body: str = ""
    category: str = "general"
    read: bool = False
    action_url: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"
