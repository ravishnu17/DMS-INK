from pydantic import BaseModel,root_validator
from datetime import date
from typing import Optional, List, Union
from .access_control import ResponseModel
from .configuration import ViewPortfolio

class FinancialYearSchema(BaseModel):
    year:str
    start_date: date
    end_date: date

class ViewFinancialYearSchema(FinancialYearSchema):
    id: int


# DataTypes Schema
class DataTypesSchema(BaseModel):
    name: str

class ViewDataTypesSchema(DataTypesSchema):
    id: int

# FileTypes Schema
class FileTypesSchema(BaseModel):
    name: str
    data_type_id: int

class ViewFileTypesSchema(FileTypesSchema):
    id: int
    data_type_id: int

class ViewCategroryFinancialDueSchema(BaseModel):
    id: Optional[int]= None
    category_id: Optional[int]= None
    due_day: Optional[int]= None  # 1-31
    due_month: Optional[int]= None  # 1-12
    financial_year_id:int
    financial_year: Optional[ViewFinancialYearSchema]= None
    pass


# category forms

# form options
class CategoryFormOptions(BaseModel):
    id:Optional[int]= None
    value: str
    default_select: bool
    order: Optional[int] = None

# form file types
class CategoryFormFileTypeMap(BaseModel):
    id:Optional[int]= None
    file_type_id: int
    file_type: Optional[ViewFileTypesSchema]= None

# form schema
class CategoryFormSchema(BaseModel):
    id:Optional[int]= None
    category_id: Optional[int]= None
    data_type_id: int
    name: str= 'No title'
    placeholder: str = 'Enter here'
    required: bool = False
    regex: Optional[str] = None
    regex_error_msg: Optional[str] = None
    max_length: Optional[int] = None
    allow_decimal: Optional[bool] = None
    max_file_size: Optional[float] = None #mb
    allow_past_date: Optional[bool] = None
    allow_future_date: Optional[bool] = None
    time_format_24: Optional[bool]= None
    date_format: Optional[str]= None
    order: Optional[int] = None
    category_form_options: Optional[List[CategoryFormOptions]] = []
    category_form_file_type_map: Optional[List[CategoryFormFileTypeMap]] = []

class CategoryUpdateFormSchema(CategoryFormSchema):
    data_type_id: Optional[int]= None
    required: Optional[bool]= None
    name: Optional[str]= None
    placeholder: Optional[str] = None

class CategoryFormOrderBaseSchema(BaseModel):
    id: int
    order: int

class CategoryFormOrderSchema(BaseModel):
    order: List[CategoryFormOrderBaseSchema]
class DeleteSchema(BaseModel):
    id: List[int]

class ViewCategoryFormSchema(CategoryFormSchema):
    data_type: ViewDataTypesSchema

# category schema
class CategoryBaseSchema(BaseModel):
    name: str
    type: Optional[str] = None
    is_renewal: bool
    renewal_iteration: Optional[int] = None
    is_due: bool
    description: Optional[str] = None
    category_financial_due_map: Optional[List[ViewCategroryFinancialDueSchema]]= []
    
    
class CategorySchema(CategoryBaseSchema):
    category_form: Optional[List[ViewCategoryFormSchema]]= []

class ViewAllCategory(BaseModel):
    id:int
    name: str
    type: Optional[str] = None
    is_renewal: bool
    renewal_iteration: Optional[int] = None
    is_due: bool
    description: Optional[str] = None
    category_financial_due_map: Optional[List[ViewCategroryFinancialDueSchema]]= []
class ViewCategorySchema(CategorySchema):
    id: int

class ViewPortfolioCategorySchema(BaseModel):
    id: int
    name:str
    type: str
    category_count: int
    mapped_count: Optional[int]= None

class ListPortfolioCategorySchema(BaseModel):
    id: int
    category_id: int
    portfolio_id: int
    portfolio: ViewPortfolio
    category: ViewAllCategory

# Response model
schema= Union[ViewFinancialYearSchema, ViewDataTypesSchema, ViewFileTypesSchema, ViewAllCategory, ViewCategoryFormSchema, ViewPortfolioCategorySchema, ListPortfolioCategorySchema]

class ResponseSchema(ResponseModel):
    data: Optional[Union[schema, List[schema]]]= None

class CategoryResponse(ResponseModel):
    data: Optional[ViewCategorySchema]= None
