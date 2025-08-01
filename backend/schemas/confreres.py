from pydantic import BaseModel,EmailStr
from typing import Optional,List

class ConfreresSchema(BaseModel):
    code:Optional[str]=None
    province_id:Optional[int]=None
    name:str
    email:EmailStr
    mobile_no:str
    country_code:str = '91'
    
class ViewConfrere(BaseModel):
    id: int
    name: Optional[str]
    code: Optional[str]
    email: str
    mobile_no: str
    country_code: str
    active: bool

    class Config:
        from_attributes = True
    
class ConfreresResponse(BaseModel):
    status:bool
    message:str
    total_count:int=0
    details: List[ViewConfrere] = []
    
    class config:
        from_attributes=True
        
class UpdateConfreres(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile_no: Optional[str] = None
    country_code: Optional[str] = '91'
    province_id:Optional[int]=None
    active: Optional[bool] = True