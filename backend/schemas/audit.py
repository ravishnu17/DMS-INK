
from pydantic import BaseModel
from typing import List, Union, Optional

# audit schema
class AuditSchema(BaseModel):
    province_id: int
    module_name:str
    record_id: int
    record_title: str
    modification_type: str
    old_value: Optional[list]= None
    new_value: Optional[list]= None
    user_id: Optional[int]= None
    user_name: Optional[str]= None

