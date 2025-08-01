from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from schemas.notification import MarkReadRequest

from models.notification import Notification
from settings.db import get_db
from settings.auth import authenticate
from schemas.access_control import Token

router = APIRouter(prefix="/notifications", tags=["Notifications"])

#API for  unread notifications
@router.get("/unread")
def get_unread_notifications( db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    try:
        user_id = curr_user.user_id

        unread_notifications = db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).all()

        data = [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "created_at": n.created_at,
                "is_read": n.is_read
            } for n in unread_notifications
        ]

        return { "status":True, "details":"Unread notifications fetched successfully","data":data}

    except Exception as e:
         { "status":False, "details":f"Error: {str(e)}","data":[]}





#API to mark a notification as read
@router.post("/mark-read")
def mark_notification_as_read(payload: MarkReadRequest, db: Session = Depends(get_db),curr_user: Token = Depends(authenticate)):
    try:
        user_id = curr_user.user_id

        notification = db.query(Notification).filter(
            Notification.id == payload.notification_id,
            Notification.user_id == user_id
        ).first()

        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")

        if notification.is_read:
            return {"status": True, "details": "Notification already marked as read"}

        notification.is_read = True
        db.commit()

        return {"status": True, "details": "Notification marked as read"}

    except Exception as e:
        db.rollback()
        return {"status": False, "details": f"Error: {str(e)}"}