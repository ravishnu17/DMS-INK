from pydantic import BaseModel
from typing import Union, List, Optional
from .access_control import ViewProvinceName, ViewCountry, ViewState, ViewRegion, ViewDistrict, RoleSchema

# Portfolio
class PortfolioSchema(BaseModel):
    name: str
    type:str

class ViewPortfolio(PortfolioSchema):
    id: int

# financial portfolio map
class FinancialPortfolioMapSchema(BaseModel):
     non_financial_portfolio_id: int
     financial_portfolio_id: Optional[List]= []

class ViewFinancialPortfolioMap(BaseModel):
    id: int

    non_financial_name: ViewPortfolio
    financial_name: ViewPortfolio

class EntityPortfolioUpdateSchema(BaseModel):
    portfolio_id: int
    financial_number: Optional[str] = None
    financial_name: Optional[str] = None
    financial_type: Optional[str] = None
    financial_viewer: Optional[int] = None
    financial_incharge: Optional[int] = None

# Incharger, Viewer schema
class User(BaseModel):
    name:str
class InchargeUserBase(BaseModel):
    id: Optional[int]= None
    user_id: int= None
    role_id: int= None
    user: Optional[User]= None
    role: Optional[RoleSchema]= None

# Financial portfolio map user
class FPSchema(BaseModel):
    id: Optional[int]= None
    portfolio_id: int
    portfolio: Optional[ViewPortfolio]= None
    name: Optional[str]= None
    number: Optional[str]= None
    type: Optional[str]= None
    
class CFPSchema(FPSchema):
    community_id: Optional[int]= None
    cfp_user: Optional[List[InchargeUserBase]]= []

# Community
class ViewCommunityName(BaseModel):
    id: int
    name: str
    portfolio_id: Optional[int]= None
    type: Optional[str]= "Community"
    community_user: Optional[List[InchargeUserBase]]= []

# update user based on entity
class UpdateUsersSchema(BaseModel):
    entity_id:int # community to company
    financial_entity_id: Optional[int]= None # EPF, ESI ...
    role_id: int # DDM or viewer 
    users: List[InchargeUserBase]

# assess for community answer mapp
class CommunityBaseSchema(BaseModel):
    code:Optional[str]= None
    acme_code: Optional[str]= None
    name: str
    province_id: Optional[int]= None
    place:str
    address: str
    country_id: int
    state_id: int
    region_id: int
    district_id: int
    community_user: Optional[List[InchargeUserBase]]= []

class CommunitySchema(CommunityBaseSchema):
    cfp: List[CFPSchema]= []

class ViewCommunity(BaseModel):
    id: int
    code:str
    acme_code: Optional[str]= None
    name: str
    province_id: Optional[int]= None
    place:str
    address: str
    community_user: Optional[List[InchargeUserBase]]= []
    country: ViewCountry
    state: ViewState
    region: ViewRegion
    district: ViewDistrict

class ViewCommunityById(CommunitySchema):
    id:int
    community_user: Optional[List[InchargeUserBase]]= []

    province: ViewProvinceName
    country: ViewCountry
    state: ViewState
    region: ViewRegion
    district: ViewDistrict

    class Config:
        from_attributes = True

# Society schema
class SFPSchema(FPSchema):
    society_id: Optional[int]= None
    sfp_user: Optional[List[InchargeUserBase]]= []
    
class SocietySchema(BaseModel):
    code:Optional[str]= None
    province_id: Optional[int]= None
    community_id: int= None
    name: str
    place:str
    address: str
    country_id: int
    state_id: int
    region_id: int
    district_id: int
    society_user: Optional[List[InchargeUserBase]]= []
    sfp: List[SFPSchema]= []

class ViewSociety(BaseModel):
    id: int
    code:str
    name: str
    province_id: int
    community_id: int= None
    place:str
    address: str
    society_user: Optional[List[InchargeUserBase]]= []
    country: ViewCountry
    state: ViewState
    region: ViewRegion
    district: ViewDistrict

class ViewSocietyById(SocietySchema):
    id:int
    province: ViewProvinceName
    community: ViewCommunityName
    country: ViewCountry
    state: ViewState
    region: ViewRegion
    district: ViewDistrict


#Schema for Diocese
class DioceseSchema(BaseModel):
    code: Optional[str]= None
    name: str
    place: str
    address: str
    province_id: Optional[int]= None
    region_id: int
    district_id: int
    state_id: int
    country_id: int

class ViewDiocese(DioceseSchema):
    id: int
    province: ViewProvinceName
    country: ViewCountry
    state: ViewState
    region: ViewRegion
    district: ViewDistrict

class ViewDiocese(BaseModel):
    id: int
    name: str

# Legal entity schema
class LEFPSchema(FPSchema):
    id: Optional[int]= None
    legal_entity_id: Optional[int]= None
    lefp_user: Optional[List[InchargeUserBase]]= []

class LegalEntitySchema(BaseModel):
        province_id: Optional[int]= None
        community_id: int
        society_id: Optional[int]= None
        portfolio_id: int
        diocese_id: Optional[int]= None
        code: Optional[str]= None
        name: str
        type: Optional[str]= None
        financial_assistance: Optional[str]= None
        board: Optional[str]= None
        affiliation: Optional[str]= None
        faculty: Optional[str]= None
        ug_pg: Optional[str]= None
        school_board: Optional[str]= None
        medium_of_instruction: Optional[str]= None
        grade: Optional[str]= None

        place: str
        address: str
        country_id: int
        state_id: int
        region_id: int
        district_id: int

        entity_user: Optional[List[InchargeUserBase]]= []
        lefp: List[LEFPSchema]= []

class ViewLegalEntity(BaseModel):
    id: int
    province_id: int
    community_id: int
    society_id: Optional[int]= None
    portfolio_id: int
    diocese_id: Optional[int]= None
    code: str
    name: str
    type: Optional[str]= None
    financial_assistance: Optional[str]= None
    board: Optional[str]= None
    affiliation: Optional[str]= None
    faculty: Optional[str]= None
    ug_pg: Optional[str]= None
    school_board: Optional[str]= None
    medium_of_instruction: Optional[str]= None
    grade: Optional[str]= None
    place:str
    address: str
    portfolio: ViewPortfolio
    country: ViewCountry
    state: ViewState
    region: ViewRegion
    district: ViewDistrict
    entity_user: Optional[List[InchargeUserBase]]= []



class ViewEntityById(LegalEntitySchema):
    id: int

    province: ViewProvinceName
    community: ViewCommunityName
    society: Optional[ViewCommunityName]= None
    portfolio: ViewPortfolio
    diocese: Optional[ViewDiocese]= None

    country: ViewCountry
    state: ViewState
    region: ViewRegion
    district: ViewDistrict


# Response

class CommunityResponse(BaseModel):
    status: bool
    details: str
    total_count: int = 0
    data: Optional[ViewCommunityById]= None

class CommunityOptionSchema(BaseModel):
    status: bool
    details: str
    total_count: int = 0
    data: List[ViewCommunityName]= []
 
class SocietyResponse(BaseModel):
    status: bool
    details: str
    total_count: int = 0
    data: Optional[ViewSocietyById]= None
 
class LegalEntityResponse(BaseModel):
    status: bool
    details: str
    total_count: int = 0
    data: Optional[ViewEntityById]= None

schemas= Union[ViewPortfolio, ViewFinancialPortfolioMap, ViewCommunity, ViewSociety, ViewLegalEntity, ViewDiocese]

class ResponseModel(BaseModel):
    status: bool
    details: str
    total_count: int = 0
    data: Optional[Union[schemas, List[schemas]]]= None

# diocese options
class DioceseOptions(BaseModel):
    id: int
    name: str

class DioceseOptionsSchema(BaseModel):
    data: List[DioceseOptions]= []
