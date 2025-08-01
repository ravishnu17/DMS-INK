from sqlalchemy import Column, Integer, String, ForeignKey, Text, BigInteger
from .answers import BaseModel, Base

class Communication(BaseModel):
    __tablename__ = 'tbl_communication'
    id = Column(Integer, primary_key=True, nullable=False, index=True)
    from_user_id= Column(Integer, ForeignKey('tbl_user.id', ondelete='SET NULL'), nullable=True, index=True)
    subject = Column(String(250), nullable=False, index=True)
    content = Column(Text, nullable=False, index=True)
    type= Column(String(150), nullable=False, index=True) # EMAIL, SMS, WEB
    status = Column(String(150), nullable=False, index=True) # DRAFT, SENT
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=True, index=True)

class CommunicationToUSers(BaseModel):
    __tablename__ = 'tbl_communicaton_to_users_map'
    id = Column(Integer, primary_key=True, nullable=False, index=True)
    communication_id = Column(Integer, ForeignKey('tbl_communication.id', ondelete='CASCADE'), nullable=False, index=True)
    to_user_id = Column(Integer, ForeignKey('tbl_user.id', ondelete='CASCADE'), nullable=False, index=True)


class CommunicationAttachment(BaseModel):
    __tablename__ = 'tbl_communication_attachment'
    id = Column(Integer, primary_key=True, nullable=False, index=True)
    communication_id = Column(Integer, ForeignKey('tbl_communication.id', ondelete='CASCADE'), nullable=False, index=True)
    file = Column(Text, nullable=False, index=True)
    file_type = Column(String(50), nullable=False, index=True)
    file_version = Column(Integer, nullable=False, index=True)
    file_size = Column(BigInteger, nullable=False, index=True) # bytes
    filename = Column(String(250), nullable=False, index=True)