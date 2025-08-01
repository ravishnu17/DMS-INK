from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: Optional[str] = None
    is_read: bool = False
    created_at: datetime

    class Config:
        orm_mode = True  # Tells Pydantic to treat the SQLAlchemy model as a dict


class NotificationCreate(NotificationBase):
    user_id: int  # This is needed when creating a notification

    class Config:
        orm_mode = True


class NotificationResponse(NotificationBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
class MarkReadRequest(BaseModel):
    notification_id: int