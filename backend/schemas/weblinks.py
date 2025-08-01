from pydantic import BaseModel
from typing import Type,Optional,List
class WebLink(BaseModel):
    province_id:Optional[int]=None
    name:str
    weblink:str
    
class WebLinks(BaseModel):
    id:int
    name:str
    weblink:str
    active:bool
    
    class Config:
        from_attributes = True
    
class WebLinksResponse(BaseModel):
    message:str
    status:bool
    total_count:Optional[int]=None
    data:Optional[WebLinks]=None
    
    class Config:
        from_attributes = True
    
class WebLinksUpdate(BaseModel):
    name:Optional[str]=None
    weblink:Optional[str]=None
    province_id:Optional[int]=None
    active:Optional[bool]=None
    
    class Config:
        from_attributes = True