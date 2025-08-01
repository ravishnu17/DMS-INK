from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .communication import Base
from datetime import datetime

class Notification(Base):
    """
    Notification model to store user notifications like password reset requests,
    renewal reminders, incharge assignments, etc.
    """

    __tablename__ = "tbl_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('tbl_user.id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="tbl_notifications")
