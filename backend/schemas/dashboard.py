from typing import List, Dict, Optional, Union
from pydantic import BaseModel


class ResponseModel(BaseModel):
    status: bool
    details: str
    total_count: int = 0

class PendingGroupSchema(BaseModel):
    entries: List[str]
    total: int

class PortfolioSummaryItem(BaseModel):
    portfolio: str
    monthly_pending: int
    quarterly_pending: int
    total: int

class PendingUploadSchema(BaseModel):
    monthly_pending: PendingGroupSchema
    quarterly_pending: PendingGroupSchema
    portfolio_pending_data: List[Dict[str, Union[str, int]]]
    total_monthly_pending: int
    total_quarterly_pending: int
    grand_total_pending: int
    portfolio_summary: List[PortfolioSummaryItem]
    
class RenewalChartDataItem(BaseModel):
    portfolio: str
    monthly: int
    quarterly: int
    half_yearly: int
    
    annual: int

class CategoryStatus(BaseModel):
    category_name: str
    status: str  # e.g., "Submitted" or "Pending"

class CommunityRenewalRow(BaseModel):
    community_name: str
    total_renewal_count: int
    total_pending_count: int
    categories: List[CategoryStatus]


class RenewalChartDataSchema(ResponseModel):
    data: Optional[List[RenewalChartDataItem]] = []


ResponseDataTypes = Union[
    PendingUploadSchema,
    List[CommunityRenewalRow],
]

class ResponseSchema(ResponseModel):
    data: Optional[Union[ResponseDataTypes, List[ResponseDataTypes]]] = []
