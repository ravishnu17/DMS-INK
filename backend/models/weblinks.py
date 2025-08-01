from sqlalchemy import Column, Integer, String, Boolean, DateTime,ForeignKey
from .confreres import BaseModel,Base

class WebLinks(BaseModel):
    __tablename__ = 'tbl_web_links'
    
    id = Column(Integer,primary_key=True,autoincrement=True,nullable=False,index=True)
    name = Column(String(250),nullable=False,index=True)
    weblink = Column(String,nullable=False,index=True)
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=False, index=True)
    