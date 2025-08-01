from pydantic import BaseModel,EmailStr,Field,validator
from typing import Union, List, Optional,Dict
from datetime import date

# location schema

# country
class CountrySchema(BaseModel):
    name:str

class ViewCountry(CountrySchema):
    id: int

# state
class StateSchema(BaseModel):
    name:str
    country_id: int

class ViewState(StateSchema):
    id: int

# region
class RegionSchema(BaseModel):
    name:str
    state_id: int

class ViewRegion(RegionSchema):
    id: int

# district
class DistrictSchema(BaseModel):
    name:str
    region_id: int
    state_id: int
    
class ViewDistrict(DistrictSchema):
    id: int


# Province
class ProvinceSchema(BaseModel):
    code:Optional[str]= None
    name: str
    place: str
    address: str
    country_id: int
    state_id: int
    region_id: int
    district_id: int

    country_ids: List[int]
    state_ids: List[int]
    region_ids: List[int]
    district_ids: List[int]

class ViewProvince(BaseModel):
    id: int
    code:str
    name: str
    place: str
    address: str
    country_id: int
    state_id: int
    region_id: int
    district_id: int

    country_ids: str
    state_ids: str
    region_ids: str
    district_ids: str

    country: ViewCountry
    state: ViewState
    region: ViewRegion
    district: ViewDistrict

class ViewProvinceById(ViewProvince):
    countries: List[ViewCountry]
    states: List[ViewState]
    regions: List[ViewRegion]
    districts: List[ViewDistrict]

class ViewProvinceName(BaseModel):
    id:int
    name:str

# access control schema
class Token(BaseModel):
    role_id:int
    user_id:int
    username:str
    province_id:Optional[int]= None

class RoleSchema(BaseModel):
    name:str

class ModuleSchema(RoleSchema):
    pass

class FeatureSchema(RoleSchema):
    module_ids: List[int] = []

class ModuleFeatureSchema(BaseModel):
    module_id: int
    feature_id: List[int]

class ViewModuleFeature(BaseModel):
    id: int
    module_id: int
    feature_id: int
    module: ModuleSchema
    feature: FeatureSchema

class RoleModuleFeatureSchema(BaseModel):
    role_id: List[int]

class RMFUpdateSchema(BaseModel):
    id: int
    status: bool

class CommunityDetails(BaseModel):
    id:int
    name : str

class PortfolioDetails(BaseModel):
    id:int
    name : str

class SocietyDetails(BaseModel):
    id:int
    name : str

class LegalEntityDetails(BaseModel):
    id:int
    name : str

class UserSchema(BaseModel):
    role_id:int
    province_id:Optional[int]= None
    name:str
    email:str
    mobile_no: Optional[str]= None
    mobile_country_code:Optional[str]= '91'
    whatsapp_no: Optional[str]= None
    whatsapp_country_code: Optional[str]= None
    dob: Optional[date]= None
    gender: Optional[str]= None
    designation: Optional[str]= None
    username:str
    # password:Optional[str]= None
    # community_ids:List[int]
    # society_ids:List[int]
    # portfolio_ids: List[int]
    # legal_entity_ids:List[int]

class UserView(BaseModel):
    id : int
    role_id:int
    province_id:Optional[int]= None
    name:str
    email:str
    mobile_no: Optional[str]= None
    mobile_country_code:Optional[str]= '91'
    whatsapp_no: Optional[str]= None
    whatsapp_country_code: Optional[str]= '91'
    dob: Optional[date]= None
    gender: Optional[str]= None
    designation: Optional[str]= None
    profile_pic: Optional[str]= None
    resign:bool= False
    resign_reason:Optional[str]= None
    username:str
    role:RoleSchema
    province : Optional[ViewProvinceName]= None
    active: bool = True
    # community_ids: List[CommunityDetails]
    # society_ids:List[SocietyDetails]
    # portfolio_ids: List[PortfolioDetails]
    # legal_entity_ids:List[LegalEntityDetails]

class CurrentUserAccess(UserView):
    community_ids: List[CommunityDetails]
    society_ids:List[SocietyDetails]
    portfolio_ids: List[PortfolioDetails]
    legal_entity_ids:List[LegalEntityDetails]
    # permissions: Dict[str, bool]

class LoginResponse(BaseModel):
    status: bool
    details: str
    access_token: Optional[str]= None
    token_type: Optional[str]= None
    user: Optional[UserView]= None

class ResponseModel(BaseModel):
    status: bool
    details: str
    total_count: int = 0


location_schema= Union[ViewCountry, ViewState, ViewRegion, ViewDistrict]
class LocationResponseModel(ResponseModel):
    data: Optional[Union[location_schema, List[location_schema]]]= None

access_schema = Union[UserView, ViewProvince, ViewProvinceById, CurrentUserAccess]
class AccessResponseModel(ResponseModel):
    data: Optional[Union[access_schema, List[access_schema]]]= None

class UserOptions(BaseModel):
    id: int
    province_id: int
    email:str
    name: str
    mobile_no: Optional[str]
    mobile_country_code: Optional[str]
    whatsapp_no: Optional[str]
    whatsapp_country_code: Optional[str]

    
class UserOptionsSchema(AccessResponseModel):
    data: List[UserOptions]= []
   

#permission
class PermissionUser(AccessResponseModel):
        permissions:Dict[str, Union[bool, dict]]


class UserPermissionsSchema(BaseModel):
    can_view_all: bool
    can_view_community: bool
    can_view_society: bool

class UserPermissionsResponse(BaseModel):
    status: bool
    details: str
    data: Optional[CurrentUserAccess] = None 

# module feature response
class ModuleFeatureResponse(ResponseModel):
    data: List[ViewModuleFeature]= []
    
#email
class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    
#change the passsword
class ResetPasswordRequest(BaseModel):
    token: str = Field(..., example="your.jwt.token.here")
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

    @validator("confirm_password")
    def passwords_match(cls, v, values, **kwargs):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("Passwords do not match")
        return v
    
#admin change the password
class AdminPassword(BaseModel):
    user_id:int
    password:str
    
#token genetrated by superadmin
class TokenSchema(BaseModel):
    access_token: str
   