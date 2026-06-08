from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(user: User = Depends(get_current_user)):
    notifs = await Notification.find(Notification.user_id == str(user.id)).sort(
        -Notification.created_at
    ).limit(50).to_list()

    return [
        {
            "id": str(n.id),
            "title": n.title,
            "body": n.body,
            "category": n.category,
            "read": n.read,
            "action_url": n.action_url,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifs
    ]


@router.patch("/{notification_id}/read")
async def mark_read(notification_id: str, user: User = Depends(get_current_user)):
    n = await Notification.get(notification_id)
    if not n or n.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Notification not found")

    n.read = True
    await n.save()
    return {"id": str(n.id), "read": True}


@router.post("/mark-all-read")
async def mark_all_read(user: User = Depends(get_current_user)):
    notifs = await Notification.find(
        Notification.user_id == str(user.id),
        Notification.read == False,
    ).to_list()

    for n in notifs:
        n.read = True
        await n.save()

    return {"count": len(notifs)}


async def create_notification(user_id: str, title: str, body: str = "", category: str = "general", action_url: str = ""):
    notif = Notification(
        user_id=user_id,
        title=title,
        body=body,
        category=category,
        action_url=action_url,
        read=False,
        created_at=datetime.utcnow(),
    )
    await notif.insert()
    return notif
