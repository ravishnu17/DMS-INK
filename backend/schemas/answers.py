from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Union, Dict, Any
from .access_control import ResponseModel
from .configuration import InchargeUserBase, CommunityBaseSchema, CFPSchema, SFPSchema, LEFPSchema
from .category import  CategoryBaseSchema, ViewFinancialYearSchema
from datetime import date
# answer schema
class AnswerDetailsSchema(BaseModel):
    id: int
    active: bool
    # community_id: Optional[int]= None
    # society_id: Optional[int]= None
    # legal_entity_id: Optional[int]= None

    # cfp_id: Optional[int]= None
    # sfp_id: Optional[int]= None
    # lefp_id: Optional[int]= None

    category_id: int
    
    entity_users: Optional[List[InchargeUserBase]] = None
    # community: Optional[CommunityBaseSchema] = None
    # society: Optional[CommunityBaseSchema] = None
    # legal_entity: Optional[CommunityBaseSchema] = None
    # cpf: Optional[CFPSchema] = None
    # sfp: Optional[SFPSchema] = None
    # lefp: Optional[LEFPSchema] = None
    category: Optional[CategoryBaseSchema] = None  

class AnswerBaseSchema(BaseModel):
    id:int
    community_answer_id: Optional[int]= None
    society_answer_id: Optional[int]= None
    legal_entity_answer_id: Optional[int]= None
    active: bool
    version: int
    financial_year: int
    financial_year_data: Optional[ViewFinancialYearSchema] = None
    start_date: Optional[date]= None
    end_date: Optional[date]= None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[Union[int, str]] = None
    updated_by: Optional[Union[int, str]] = None

class AnswerDataSchema(AnswerBaseSchema):
    answer_data: Dict[str, Union[Dict[str, Any], List[Dict[str, Any]]]]  # JSONB format for different types

class AnswerSchema(BaseModel):
    answer_details: AnswerDetailsSchema
    answers: List[AnswerBaseSchema]
# Response model
schema= Union[AnswerSchema]

class ResponseSchema(ResponseModel):
    data: Optional[Union[schema, List[schema]]]= None

class AnswerResponse(ResponseModel):
    data: Optional[AnswerDataSchema]= None