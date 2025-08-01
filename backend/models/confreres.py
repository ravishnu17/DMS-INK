from sqlalchemy import Column,String,Integer,BigInteger,ForeignKey
from .category import Base,BaseModel

class Confreres(BaseModel):
    __tablename__="tbl_confreres"
    
    id= Column(Integer,primary_key=True,autoincrement=True,nullable=False,index=True)
    code= Column(String(100),nullable=False,index=True)
    name=Column(String(250),nullable=False,index=True)
    email=Column(String(250),nullable=False,index=True)
    mobile_no=Column(String(32),nullable=False,index=True)
    country_code=Column(String(32),nullable=False,index=True)
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=False, index=True)
    