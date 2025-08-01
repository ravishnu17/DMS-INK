from pydantic import BaseModel
from .answers import ResponseModel
from  typing import List, Union, Optional,Dict
from datetime import datetime,date
from schemas.access_control import UserView
class PortfolioSchema(BaseModel):
    name:str

class FinancialPortfolioSchema(BaseModel):
    id:int
    number: Optional[str]= None
    name:Optional[str]= None
    portfolio: Optional[PortfolioSchema]= {}
    type: Optional[str]= None
class NonFinancialSchema(BaseModel):
    id:int
    code:str
    name:str
    place: Optional[str]= None


class LegalEntitySchema(NonFinancialSchema):
    portfolio: Optional[PortfolioSchema]= {}
    lefp: Optional[List[FinancialPortfolioSchema]]= []

class CommunitySocietySchema(NonFinancialSchema):
    sfp: Optional[List[FinancialPortfolioSchema]]= []

class SocietySchema(CommunitySocietySchema):
    legal_entity: Optional[List[LegalEntitySchema]]= []

class CommunitySchema(NonFinancialSchema):
    cfp: Optional[List[FinancialPortfolioSchema]]= []
    society: Optional[List[CommunitySocietySchema]]= []
    legal_entity: Optional[List[LegalEntitySchema]]= []

class DocumentStatusRequestParams(BaseModel):
    legal_entity_id: Optional[int] = None
    society_id: Optional[int] = None
    community_id: Optional[int] = None
    category_id: int
    cfp_id: Optional[int] = None
    sfp_id: Optional[int] = None
    lefp_id: Optional[int] = None
    financial_year_id: Optional[int] = None

class MemberDocumentStatusRequestParams(DocumentStatusRequestParams):
    date_range: Optional[str] = None
    

class DocumentFilter(BaseModel):
    category_id: int
    financial_year_id: Optional[int] = None

class DocumentFilterResponse(BaseModel):
    label: str
    value: str

class StatusDataItem(BaseModel):
    duration: str
    created_at: Optional[datetime] 
    status: bool

# periodical schema
class CategorySchema(BaseModel):
    id: int
    name: str
    type: str
    is_renewal: bool
    renewal_iteration: Optional[int] = None
    is_due: bool
    description: Optional[str] = None
class CategoryMapp(BaseModel):
    id:int
    category: CategorySchema
class PeriodicalSchema(BaseModel):
    id:int
    name:str
    type:str
    portfolio_category_map: List[CategoryMapp]

class DocumentData(BaseModel):
    id: int
    version: int
    answer_data: Union[str, dict]   # or dict if your `answer_data` is JSON
    created_at: datetime
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class MemberDocument(BaseModel):
    name: str
    ddm_user: Optional[str] = None
    documents: List[DocumentData]


class EntityResponse(BaseModel):
    entity_id: int
    entity_code: Optional[str]
    entity_place: Optional[str]
    entity_address: Optional[str]
    state: Optional[str]
    district: Optional[str]
    region: Optional[str]
    name: str
    model: str

class PortfolioResponse(BaseModel):
    portfolio_id: int
    portfolio_name: str
    portfolio_entities: List[EntityResponse]

class CategoryResponse(BaseModel):
    category_id: int
    category_type: str
    is_renewal: bool
    category_name: str
    answers: List[Dict]

class AnswerDataResponse(BaseModel):
    id: int
    start_date: Optional[date]
    end_date: Optional[date]
    answer_data: Dict


schemas= Union[SocietySchema, CommunitySchema,StatusDataItem, PeriodicalSchema,MemberDocument,DocumentFilterResponse,UserView]

class ResponseSchema(ResponseModel):
    data: Optional[Union[schemas, List[schemas]]]= []