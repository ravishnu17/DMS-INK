# schemas/communication.py
from .answers import ResponseModel
from pydantic import BaseModel, Field
from typing import List, Optional,Union
from datetime import datetime


class CommunicationBase(BaseModel):
    subject: str
    content: str
    type: str  
    status: str  


class CommunicationCreate(CommunicationBase):
    # from_user_id: Optional[int] = None
    recipients: Optional[List[dict]] = []
    # attachments: List[str] = []  

class SMSRecipient(BaseModel):
    phone_number: str
    id: int

class CommunicationSMS(BaseModel):
    recipients: List[SMSRecipient]
    message: str

class CommunicationResponse(CommunicationBase):
    id: int
    from_user_id: Optional[int]
    created_at: datetime


class CommunicationView(CommunicationBase):
    id: int
    recipients: List[dict]
    sent_at: Optional[datetime]
    sent_by: Optional[str]
    status: str
    attachments: List[dict]

schemas= Union[CommunicationView]

class ResponseModel(BaseModel):
    status: bool
    details: str
    total_count: int = 0
    data: Optional[Union[schemas, List[schemas]]]= None







