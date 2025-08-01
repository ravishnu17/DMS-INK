from collections import defaultdict
from datetime import date, datetime, timezone
from typing import Annotated, List, Optional,Dict,Union
import calendar
from itertools import chain

from fastapi import APIRouter, Depends
from sqlalchemy import func, and_
from sqlalchemy.orm import Session, joinedload, selectinload,class_mapper

from dateutil.relativedelta import relativedelta

from settings.db import get_db
from settings.auth import authenticate
from settings.config import secret

from schemas.access_control import Token, UserView, RoleSchema
from schemas.report import (
    ResponseSchema,
    DocumentStatusRequestParams,
    DocumentFilter,
    DocumentFilterResponse,
    MemberDocumentStatusRequestParams,
    AnswerDataResponse,
    CategoryResponse,
    PortfolioResponse
   
)

from constants.constant import limit_count, split_month_ranges_custom

from models.answers import Answer, AnswerData
from models.access_control import User, Role, Country, State, Region, District
from models.category import Category, FinancialYear, PortfolioCategoryMap
from models.configuration import (
    Society,
    Community,
    LegalEntity,
    CFP,
    SFP,
    LEFP,
    Portfolio,
    CommunityUser,
    SocietyUser,
    LegalEntityUser,
    CFPUser,
    SFPUser,
    LEFPUser,
)


router= APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

# ------------- common function -------------------
def get_period_name(start_date, end_date, iter_count):
    """
    Helper function to generate period names based on date range and iteration count
    """
    if iter_count == 1:  # Monthly
        return start_date.strftime('%b')
    elif iter_count == 3:  # Quarterly
        return f"{start_date.strftime('%b')}-{end_date.strftime('%b')}"
    elif iter_count == 6:  # Half-yearly
        return f"{start_date.strftime('%b')}-{end_date.strftime('%b')}"
    else:
        return f"{start_date.strftime('%b %d')}-{end_date.strftime('%b %d')}"


def split_month_ranges_custom(start_date, end_date, month_count):
    """
    Split a date range into sub-ranges of specified month counts
    """
    ranges = []
    current_start = start_date
    
    while current_start < end_date:
        current_end = current_start + relativedelta(months=month_count) - relativedelta(days=1)
        if current_end > end_date:
            current_end = end_date
        ranges.append((current_start, current_end))
        current_start = current_end + relativedelta(days=1)
    
    return ranges

# ----------------------- Document hierarchy ----------------------

# society level
@router.get("/society", response_model=ResponseSchema)
def get_society_level(province_id: int = None, skip: int = 0, limit: int = limit_count, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    if not province_id:
        province_id= curr_user.province_id
    if not province_id:
        return {"status": False, "details": "Province not found"}
    society_data= db.query(Society).filter(Society.province_id == province_id, Society.active == True).order_by(Society.name.asc())
    total_count= society_data.count()
    if limit:
        society_data= society_data.offset(skip).limit(limit)
    society_data= society_data.all()
    return {"status": True, "details": "Societies fetched successfully", "total_count": total_count, "data": society_data}

# community level
@router.get("/community", response_model=ResponseSchema)
def get_community_level(province_id: int = None, skip: int = 0, limit: int = limit_count, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    if not province_id:
        province_id= curr_user.province_id
    if not province_id:
        return {"status": False, "details": "Province not found"}
    community_data= db.query(Community).filter(Community.province_id == province_id, Community.active == True).order_by(Community.name.asc())
    total_count= community_data.count()
    if limit:
        community_data= community_data.offset(skip).limit(limit)
    community_data= community_data.all()
    return {"status": True, "details": "Societies fetched successfully", "total_count": total_count, "data": community_data}



# get status of documents uploaded based on year and month
@router.get("/status/", response_model=ResponseSchema)
def get_document_status(
    params: DocumentStatusRequestParams = Depends(),
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate),
):
    """
    Get status of uploaded documents grouped by month or year based on the category type and portfolio selection.

    - **category_id**: Required, used to determine renewal type (month/year) and iteration count.
    - **financial_year_id**: Required only if category type is 'month'.
    - **One of the following portfolio IDs is required**: legal_entity_id, society_id, community_id, cfp_id, sfp_id, lefp_id

    Returns:
    - A list of objects with `duration`, `created_at`, and `status` (bool).
    """

    try:
        # Validate category
        category = db.query(Category).filter(Category.id == params.category_id).first()
        if not category:
            return ResponseSchema(status=False, details="Category not found", data=[])

        if category.type.lower() == "month" and not params.financial_year_id:
            return ResponseSchema(status=False, details="Financial year is required for 'month' type category", data=[])

        # Base query for answers
        data_query = db.query(Answer).filter(Answer.category_id == category.id)

        # Determine the selected portfolio type and apply filter
        portfolio_map = {
            "legal_entity_id": (params.legal_entity_id, LegalEntity, Answer.legal_entity_id),
            "society_id": (params.society_id, Society, Answer.society_id),
            "community_id": (params.community_id, Community, Answer.community_id),
            "cfp_id": (params.cfp_id, CFP, Answer.cfp_id),
            "sfp_id": (params.sfp_id, SFP, Answer.sfp_id),
            "lefp_id": (params.lefp_id, LEFP, Answer.lefp_id),
        }

        data = None
        for key, (value, model, answer_field) in portfolio_map.items():
            if value:
                exists = db.query(model).filter(model.id == value).first()
                if not exists:
                    return ResponseSchema(status=False, details=f"{model.__name__} not found", data=[])
                data = data_query.filter(answer_field == value).first()
                break

        

        # Start constructing the status data
               # Don't return early — allow continuing even if no data (i.e., Answer) is found
        # Instead, store the answer ID if found
        answer_id = data.id if data else None

        # Start constructing the status data
        status_data = []

        if category.is_renewal:
            iter_count = category.renewal_iteration or 1

            if category.type.lower() == "month":
                fy = db.query(FinancialYear).filter(FinancialYear.id == params.financial_year_id).first()
                if not fy:
                    return ResponseSchema(status=False, details="Financial Year not found", data=[])

                iter_ranges = split_month_ranges_custom(fy.start_date, fy.end_date, iter_count)

                for start, end in iter_ranges:
                    computed_end = start + relativedelta(months=iter_count) - relativedelta(days=1)
                    ans_data = None

                    if answer_id:
                        ans_data = db.query(AnswerData).filter(
                            AnswerData.active == True,
                            AnswerData.answer_id == answer_id,
                            AnswerData.start_date >= start,
                            AnswerData.end_date <= computed_end
                        ).order_by(AnswerData.id.desc()).first()

                    label = f"{start.strftime('%b')}-{end.strftime('%b')}" if iter_count > 1 else start.strftime('%b')

                    status_data.append({
                        "duration": label,
                        "created_at": ans_data.created_at if ans_data else None,
                        "status": bool(ans_data)
                    })

            elif category.type.lower() == "year":
                all_years = db.query(FinancialYear).order_by(FinancialYear.start_date).all()

                for i in range(0, len(all_years), iter_count):
                    group = all_years[i:i + iter_count]
                    if not group:
                        continue

                    start_date = group[0].start_date
                    end_date = group[-1].end_date
                    try:
                        start_year = int(group[0].year.split('-')[0])
                        end_year = int(group[-1].year.split('-')[1])
                    except Exception:
                        return ResponseSchema(status=False, details="Invalid year format in FinancialYear", data=[])

                    label = f"{start_year}-{end_year}" if start_year != end_year else str(start_year)

                    ans_data = None
                    if answer_id:
                        ans_data = db.query(AnswerData).filter(
                            AnswerData.active == True,
                            AnswerData.answer_id == answer_id,
                            AnswerData.start_date >= start_date,
                            AnswerData.end_date <= end_date
                        ).order_by(AnswerData.id.desc()).first()

                    status_data.append({
                        "duration": label,
                        "created_at": ans_data.created_at if ans_data else None,
                        "status": bool(ans_data)
                    })


        return ResponseSchema(
            status=True,
            details="Data fetched successfully",
            total_count=len(status_data),
            data=status_data
        )

    except Exception as e:
        return ResponseSchema(status=False, details=str(e), data=[])


# periodical reports
@router.get("/periodicallist")
def get_periodical_list(search: str = None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    categories_subquery = db.query(Category.id).filter( Category.province_id == curr_user.province_id, Category.active == True, Category.is_renewal == True).scalar_subquery()
    if curr_user.role_id == secret.s_admin_role or curr_user.role_id == secret.p_admin_role:
        query = db.query(Portfolio)
    else:
        user_models = [
            (CommunityUser, "community_id", Community),
            (SocietyUser, "society_id", Society),
            (LegalEntityUser, "legal_entity_id", LegalEntity),
            (CFPUser, "cfp_id", CFP),
            (SFPUser, "sfp_id", SFP),
            (LEFPUser, "lefp_id", LEFP),
        ]
        ids = []
        for user_model, id_field, model in user_models:
            entity_ids = db.query(user_model).filter(
                user_model.user_id == curr_user.user_id,
                # user_model.role_id == secret.ddm_user_role
            ).values(getattr(user_model, id_field))
            
            # Extract scalar values from the Row objects
            for entity_id in entity_ids:
                # Get the first value from the Row tuple
                id_value = entity_id[0] if entity_id else None
                if id_value:
                    entity = db.query(model).filter(getattr(model, "id") == id_value).first()
                    if entity:
                        ids.append(entity.portfolio_id)
        
        query = db.query(Portfolio).filter(Portfolio.id.in_(ids))
    total_count = query.count()

    query = query.join(PortfolioCategoryMap).filter( PortfolioCategoryMap.category_id.in_(categories_subquery))
    latest_financial_year = db.query(FinancialYear).order_by(FinancialYear.start_date.desc()).first()
    if search:
        query = query.filter(func.lower(Portfolio.name).contains(search.lower()))

    query = query.order_by(Portfolio.id.asc())
    data = query.all()

    filtered_data = []
    for portfolio in data:
        filtered_portfolio = {
            "id": portfolio.id,
            "name": portfolio.name,
            "portfolio_category_map": [
                {
                    "category": {
                        "id": m.category.id,
                        "type": m.category.type,
                        **(
                            {"latest_financial_year_id": latest_financial_year.id}
                            if m.category.type.lower() == "month" 
                            else {}
                        ),
                        "renewal_iteration": m.category.renewal_iteration,
                        "description": m.category.description,
                        "created_at": m.category.created_at,
                        "updated_at": m.category.updated_at,
                        "province_id": m.category.province_id,
                        "name": m.category.name,
                        "is_renewal": m.category.is_renewal,
                        "is_due": m.category.is_due,
                        "active": m.category.active,
                        "created_by": m.category.created_by,
                        "updated_by": m.category.updated_by,
                    }
                }
                for m in portfolio.portfolio_category_map
                if m.category and m.category.is_renewal
            ]
        }
        filtered_data.append(filtered_portfolio)

        
    return {"status": True, "details": "Periodical reports fetched successfully", "total_count": total_count, "data": filtered_data}

# filter list to get answer between date range
@router.get("/periodicalFilter", response_model=ResponseSchema)
def get_answer_filter_data(
    params: DocumentFilter = Depends(),
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate),
):
    """
    Retrieve time range filters (month/year based) for document answers based on category and financial year.

    - **category_id**: ID of the category (must exist)
    - **financial_year_id**: Required if category is of type 'month'
    - Returns list of time ranges (labels + date ranges) based on renewal iteration and category type
    """
    category_id = params.category_id
    financial_year_id = params.financial_year_id

    # Step 1: Validate category
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return ResponseSchema(status=False, details="Category not found", data=[])

    iter_count = category.renewal_iteration or 1
    category_type = category.type.lower()
    
    # Step 2: Handle 'month'-based categories
    if category_type == "month":
        if not financial_year_id:
            return ResponseSchema(
                status=False,
                details="Financial Year ID is required for category type 'month'",
                data=[]
            )

        # Validate financial year
        fy = db.query(FinancialYear).filter(FinancialYear.id == financial_year_id).first()
        if not fy:
            return ResponseSchema(status=False, details="Financial Year not found", data=[])

        # Generate month-based iterations
        month_ranges = split_month_ranges_custom(fy.start_date, fy.end_date, iter_count)
        data = [
            DocumentFilterResponse(
                label=f"{start.strftime('%b')}-{end.strftime('%b')}" if iter_count > 1 else start.strftime('%b'),
                value=f"{start.strftime('%Y-%m-%d')} - {end.strftime('%Y-%m-%d')}"
            )
            for start, end in month_ranges
        ]
        data.sort(key=lambda x: x.value, reverse=True)
        return ResponseSchema(status=True, details="Data fetched successfully", data=data)

    # Step 3: Handle 'year'-based categories
    elif category_type == "year":
        financial_years = db.query(FinancialYear).order_by(FinancialYear.start_date).all()

        data = []
        for i in range(0, len(financial_years), iter_count):
            group = financial_years[i:i + iter_count]
            if not group:
                continue

            start_fy = group[0]
            end_fy = group[-1]

            try:
                start_year = int(start_fy.year.split('-')[0])
                end_year = int(end_fy.year.split('-')[1])
            except (ValueError, IndexError):
                return ResponseSchema(status=False, details="Invalid year format in FinancialYear records", data=[])

            label = f"{start_year}-{end_year}" if start_year != end_year else str(start_year)

            data.append(DocumentFilterResponse(
                label=label,
                value=f"{start_fy.start_date.strftime('%Y-%m-%d')} - {end_fy.end_date.strftime('%Y-%m-%d')}"
            ))
            data.sort(key=lambda x: x.value, reverse=True)
        return ResponseSchema(status=True, details="Data fetched successfully", data=data)

    # Step 4: Unknown category type
    return ResponseSchema(status=False, details="Unknown category type", data=[])

@router.get("/membersByCategory")
def get_members_by_category(
    db: Session = Depends(get_db),
    portfolio_id: int = None,
    date_range: Optional[str] = None,
    category_id: int = None,
    curr_user: Token = Depends(authenticate),
):
    try:
        if not portfolio_id:
            return ResponseSchema(status=False, details="Portfolio ID is required", data=[])
        if not category_id:
            return ResponseSchema(status=False, details="Category ID is required", data=[])

        category = db.query(Category).filter(Category.id == category_id).first()
        if not category or not category.is_renewal:
            return ResponseSchema(status=False, details="Invalid or non-renewal category", data=[])

        start_date, end_date = None, None
        if not date_range:
            return ResponseSchema(status=False, details="Date range is required", data=[])
        
        if date_range:
            try:
                start_str, end_str = date_range.split(" - ")
                start_date = datetime.strptime(start_str.strip(), "%Y-%m-%d").date()
                end_date = datetime.strptime(end_str.strip(), "%Y-%m-%d").date()
            except ValueError:
                return ResponseSchema(status=False, details="Invalid date format. Use YYYY-MM-DD - YYYY-MM-DD", data=[])
        
        portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            return ResponseSchema(status=False, details="Portfolio not found", data=[])

        member_docs = []
        ptype = (portfolio.type or "").strip().lower().replace(" ", "")
        pname = (portfolio.name or "").strip().lower()

        entity_map = {
            "community": (Community, CommunityUser, "community_id"),
            "society": (Society, SocietyUser, "society_id"),
            "nonfinancial": (LegalEntity, LegalEntityUser, "legal_entity_id")
        }

        if pname in entity_map or ptype in entity_map:
            key = pname if pname in entity_map else ptype
            model, user_model, field = entity_map[key]
            if curr_user.role_id == secret.s_admin_role or curr_user.role_id == secret.p_admin_role:
                members = db.query(model).all() if key in ["community", "society"] else db.query(model).filter(model.portfolio_id == portfolio_id).all()
            else:
                members = db.query(model).join(user_model).filter(
                    getattr(user_model, field) == model.id,
                    user_model.user_id == curr_user.user_id,
                    # user_model.role_id == secret.ddm_user_role
                ).filter(model.portfolio_id == portfolio_id).all()
            for member in members:
                if not member:
                    continue
                answers = db.query(Answer).filter(getattr(Answer, field) == member.id, Answer.category_id == category_id).all()
                documents = []
                latest_version_date = None
                for answer in answers:
                    if not answer:
                        continue
                    version = 0 
                    for ad in db.query(AnswerData).filter(AnswerData.answer_id == answer.id,AnswerData.active == True,).all():
                        if start_date and end_date:
                            if not (ad.start_date <= end_date and ad.end_date >= start_date):
                                continue
                        if ad.version > version:
                            version = ad.version
                            latest_version_date = ad.created_at
                        documents.append({
                            "id": ad.id,
                            "version": ad.version,
                            "created_at": ad.created_at,
                            "start_date": ad.start_date,
                            "end_date": ad.end_date,
                            "answer_data": ad.answer_data
                        })

                user_link = db.query(user_model).filter(getattr(user_model, field) == member.id, user_model.role_id == secret.ddm_user_role).first()
                user = db.query(User).filter(User.id == user_link.user_id).first() if user_link else None
                member_docs.append({
                    "name": getattr(member, "name", "N/A"),
                    "code": getattr(member, "code", None),
                    "email": getattr(user, "email", None),
                    "mobile_no": getattr(user, "mobile_no", None),
                    "ddm_user": getattr(user, "name", None),
                    "documents": documents,
                    "latest_version_date": latest_version_date
                })

        elif ptype == "financial":
            financial_types = [
                (CFP, CFPUser, "cfp_id", Community, "community_id"),
                (SFP, SFPUser, "sfp_id", Society, "society_id"),
                (LEFP, LEFPUser, "lefp_id", LegalEntity, "legal_entity_id")
            ]
            for model, user_model, id_field, join_model, join_id in financial_types:
                if curr_user.role_id == secret.s_admin_role or curr_user.role_id == secret.p_admin_role:
                    items = db.query(model).filter(model.portfolio_id == portfolio_id).all()
                else:
                    items = db.query(model).join(user_model).filter(
                        getattr(user_model, id_field) == model.id,
                        user_model.user_id == curr_user.user_id,
                        # user_model.role_id == secret.ddm_user_role
                        
                    ).filter(model.portfolio_id == portfolio_id).all()
                    
                for item in items:
                    entity = db.query(join_model).filter(join_model.id == getattr(item, join_id)).first()
                    if not entity:
                        continue
                    answers = db.query(Answer).filter(getattr(Answer, id_field) == item.id, Answer.category_id == category_id).all()
                    documents = []
                    latest_version_date = None
                    for answer in answers:
                        if not answer:
                            continue
                        version = 0 
                        for ad in db.query(AnswerData).filter(AnswerData.answer_id == answer.id,AnswerData.active == True,).all():
                            if start_date and end_date:
                                if not (ad.start_date <= end_date and ad.end_date >= start_date):
                                    continue
                            if ad.version > version:
                                version = ad.version
                                latest_version_date = ad.created_at
                            documents.append({
                                "id": ad.id,
                                "version": ad.version,
                                "created_at": ad.created_at,
                                "start_date": ad.start_date,
                                "end_date": ad.end_date,
                                "answer_data": ad.answer_data,
                                "latest_version_date": latest_version_date,
                                
                               
                            })
                            
                    name = getattr(entity, "name", "N/A")
                    
                    if portfolio.type.lower() == "financial":
                        name = f"{name} - {portfolio.name}"
                    user_link = db.query(user_model).filter(getattr(user_model, id_field) == item.id,user_model.role_id == secret.ddm_user_role).first()
                    user = db.query(User).filter(User.id == user_link.user_id).first() if user_link else None
                    member_docs.append({
                        "name": name,
                        "code": getattr(entity, "code", None),
                        "email": getattr(user, "email", None),
                        "mobile_no": getattr(user, "mobile_no", None),
                        "ddm_user": getattr(user, "name", None),
                        "documents": documents,
                        "type": getattr(item, "type", None),
                        
                    })

        return {"status": True, "details": "Data fetched successfully", "data": member_docs}

    except Exception as e:
        # Log exception here if logging is set up
        return {"status": False, "details": f"Internal server error: {str(e)}", "data": []}



# ddmuserList
@router.get("/ddmUserList")
def ddmUserList(limit: int = None, skip: int = 0, db: Session = Depends(get_db), curr_user=Depends(authenticate)):
    """
    Retrieve a list of all DDM users with specific fields.

    - **limit**: Optional; number of records to return
    - **skip**: Optional; number of records to skip
    - Returns a list of UserView objects
    """
    try:
        # Get base entities based on user role
            if curr_user.role_id == secret.s_admin_role:
                community_ids = [c.id for c in db.query(Community).all()]
                society_ids = [s.id for s in db.query(Society).all()]
                legal_entity_ids = [l.id for l in db.query(LegalEntity).all()]
            elif curr_user.role_id == secret.p_admin_role:
                community_ids = [c.id for c in db.query(Community).filter_by(province_id=curr_user.province_id).all()]
                society_ids = [s.id for s in db.query(Society).filter_by(province_id=curr_user.province_id).all()]
                legal_entity_ids = [l.id for l in db.query(LegalEntity).filter_by(province_id=curr_user.province_id).all()]
            else:
                community_ids = [c.id for c in db.query(Community).filter_by(province_id=curr_user.province_id).all()]
                society_ids = [s.id for s in db.query(Society).filter_by(province_id=curr_user.province_id).all()]
                legal_entity_ids = [l.id for l in db.query(LegalEntity).filter_by(province_id=curr_user.province_id).all()]
                

            # Get financial entities
            cfp_ids = [x.id for x in db.query(CFP).filter(CFP.community_id.in_(community_ids)).all()]
            sfp_ids = [x.id for x in db.query(SFP).filter(SFP.society_id.in_(society_ids)).all()]
            lefp_ids = [x.id for x in db.query(LEFP).filter(LEFP.legal_entity_id.in_(legal_entity_ids)).all()]

            # Get all related user IDs
            user_models = [
                (CommunityUser, "community_id", community_ids),
                (SocietyUser, "society_id", society_ids),
                (LegalEntityUser, "legal_entity_id", legal_entity_ids),
                (CFPUser, "cfp_id", cfp_ids),
                (SFPUser, "sfp_id", sfp_ids),
                (LEFPUser, "lefp_id", lefp_ids),
            ]

            user_ids = set()
            for model, id_field, ids in user_models:
                if curr_user.role_id == secret.p_admin_role or curr_user.role_id == secret.s_admin_role:
                    user_ids.update(
                        uid for (uid,) in db.query(model.user_id).filter(getattr(model, id_field).in_(ids)).all()
                    )
                else:
                    user_ids.update(
                        uid for (uid,) in db.query(model.user_id).filter(getattr(model, id_field).in_(ids), model.user_id == curr_user.user_id).all()
                    )

            users = db.query(User).filter(User.id.in_(user_ids)).order_by(User.name).all()
            return {
                "status": True,
                "detail": "Users fetched successfully",
                "data": [serialize_model(u) for u in users]
            }

    except Exception as e:
       
        return {"status": False, "details": f"Internal server error: {str(e)}", "data": []}

# ddmuser document list

@router.get("/ddmWorkDoneReport")
def get_ddm_work_done_report(
    ddmUserId: str,
    monthly: bool = False,
    quarterly: bool = False,
    half_yearly: bool = False,
    yearly: bool = False,
    db: Session = Depends(get_db),
    curr_user=Depends(authenticate)   
):
    try:
        if not ddmUserId:
            return {"status":False, "details":"DDM User ID is required"}
        if not db.query(User).filter(User.id == ddmUserId).first():
            return {"status":False, "details":"Invalid DDM User ID"}
        if not any([monthly, quarterly, half_yearly, yearly]):
            return {"status": False, "details": "Select at least one time period (monthly, quarterly, half-yearly, or yearly)"}
   
    # Define user entity relationships mapping structure
        user_models = [
            (CommunityUser, "community_id", Community, "community", "non_financial"),
            (SocietyUser, "society_id", Society, "society", "non_financial"),
            (LegalEntityUser, "legal_entity_id", LegalEntity, "legal_entity", "non_financial"),
            (CFPUser, "cfp_id", CFP, "cfp", "financial"),
            (SFPUser, "sfp_id", SFP, "sfp", "financial"),
            (LEFPUser, "lefp_id", LEFP, "lefp", "financial"),
        ]
        renewal_iterations = []
        selected_category_type = None

        if monthly: renewal_iterations.append(1)
        if quarterly: renewal_iterations.append(3)
        if half_yearly: renewal_iterations.append(6)
        if yearly: selected_category_type = "year"
        if any([monthly, quarterly, half_yearly]): selected_category_type = "month"

        financial_years = db.query(FinancialYear).all()
        
        report = []
        category_query = db.query(Category).filter(Category.is_renewal == True)
        if selected_category_type:
            category_query = category_query.filter(func.lower(Category.type) == selected_category_type)
        if renewal_iterations:
            category_query = category_query.filter(Category.renewal_iteration.in_(renewal_iterations))
        entity_data = []
        for user_model, id_field, entity_model, entity_field, entity_type in user_models:
            related_entity = [getattr(x, id_field) for x in db.query(user_model).filter(user_model.user_id == ddmUserId).all()]
            

            entity_data.append({
                "entity_ids": related_entity,
                "entity_model": entity_model,
                "id_field": id_field,
                "entity_field": entity_field,
                "entity_type": entity_type

            }) if related_entity else None
        if not entity_data:
            return {"status":False, "details":"The user is not Incharge of any Portfolio"}    
        for entity in entity_data:
            ids = entity["entity_ids"]
            model = entity["entity_model"]
            field = entity["id_field"]
            entity_field = entity["entity_field"]
            entity_type = entity["entity_type"]
            data = []
            for id in ids:
                entity_query = db.query(model).filter(model.id == id).first()
                portfolio_id = entity_query.portfolio_id
                portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()

                if entity_type == "non_financial":
                    entity_name = f"{portfolio.name} - {entity_query.name}"
                elif entity_type == "financial":
                    entity_name = entity_query.name  or entity_query.number or f"{portfolio.name}"

                category_ids = db.query(PortfolioCategoryMap).filter(
                    PortfolioCategoryMap.portfolio_id == portfolio_id
                ).all()

                categories = category_query.filter(
                    Category.id.in_([x.category_id for x in category_ids])
                ).all()

                category_data = []

                for category in categories:
                    ans = db.query(Answer).filter(
                        Answer.category_id == category.id,
                        getattr(Answer, field) == entity_query.id
                    ).all()

                    iter_count = category.renewal_iteration

                    if category.type.lower() == "month":
                        period_type = get_period_type(iter_count)
                        year_data =[]
                        for fy in financial_years:
                            iter_ranges = split_month_ranges_custom(fy.start_date, fy.end_date, iter_count)
                            year_key = fy.year
                            periods_data = {}
                            
                            if ans:
                                answer_data_entries = db.query(AnswerData).filter(
                                    AnswerData.active == True,
                                    AnswerData.answer_id.in_([answer.id for answer in ans]),
                                    AnswerData.start_date >= fy.start_date,
                                    AnswerData.end_date <= fy.end_date
                                ).all()
                                uploaded_periods = set()

                                for ad in answer_data_entries:
                                    for idx, (start, end) in enumerate(iter_ranges):
                                        if ad.start_date <= end and ad.end_date >= start:
                                            period_name = get_period_name(start, end, iter_count)
                                            uploaded_periods.add(period_name)

                            else:
                                uploaded_periods = set()

                            for idx, (start, end) in enumerate(iter_ranges):
                                period_name = get_period_name(start, end, iter_count)
                                periods_data[period_name] = period_name in uploaded_periods
                            year_data.append({
                                "year": year_key,
                                period_type: periods_data
                            })
                        category_data.append({
                            "category_name": category.name,
                            "category_id": category.id,
                            "year_data": year_data
                        })

                    elif category.type.lower() == "year":
                        period_type = "years"
                        periods_data = {}
                        for i in range(0, len(financial_years), iter_count):
                            group = financial_years[i:i + iter_count]
                            if not group:
                                continue
                            start_date = group[0].start_date
                            end_date = group[-1].end_date

                            try:
                                start_year = int(group[0].year.split('-')[0])
                                end_year = int(group[-1].year.split('-')[1])
                            except (ValueError, IndexError):
                                return {"status": False, "detail": "Invalid year format in FinancialYear", "data": []}

                            year_key = f"{start_year}-{end_year}" if start_year != end_year else str(start_year)

                            uploaded = db.query(AnswerData).filter(
                                AnswerData.active == True,
                                AnswerData.answer_id.in_([answer.id for answer in ans]),
                                AnswerData.start_date >= start_date,
                                AnswerData.end_date <= end_date
                            ).first() is not None

                            periods_data[year_key] = uploaded

                        category_data.append({
                            "category_name": category.name,
                            "category_id": category.id,
                            period_type: periods_data
                        })

                data.append({
                    "entity_name": entity_name,
                    "entity_id": entity_query.id,
                    "entity_type": entity_type,
                    "category_data": category_data,
                })if category_data else None

            report.append({
                "entity_type": entity_type,
                "entities": data
            })if data else None

        return {"status": True, "data": report}

    except Exception as e:
        return {"status": False, "detail": str(e), "data": []}


@router.get("/communityWorkdoneReport")
def communityWiseWorkdoneReport(
    community_id: int = None,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        entities = []
        community = db.query(Community).filter(Community.id == community_id).first()
        if not community:
            return {"status": False, "detail": "Community not found", "data": []}
        # if community.status != "active":
        #     return {"status": False, "detail": "Community is not active", "data": []}
        if community:
            portfolio = db.query(Portfolio).filter(Portfolio.id == community.portfolio_id).first()
            entities.append({
                "id": community.id,
                "model": Community,
                "field": "community_id",
                "portfolio_id": portfolio.id,
                "entity_name": f"{community.name}-community",
                "entity_type": "Non Financial"
            })
        cfp = db.query(CFP).filter(CFP.community_id == community.id).all()
        if cfp:
            for cfp in cfp:
                portfolio = db.query(Portfolio).filter(Portfolio.id == cfp.portfolio_id).first()
                entities.append({"id": cfp.id,
                                  "model": CFP, 
                                  "field": "cfp_id",
                                  "portfolio_id":portfolio.id,
                                  "entity_name":f"{portfolio.name}",
                                  "entity_type": "Financial"
                                  })
        data = []
        for  entity in entities:      
            categories = db.query(PortfolioCategoryMap.category_id).filter(PortfolioCategoryMap.portfolio_id == entity["portfolio_id"]).all()
            category_ids = [category.category_id for category in categories]
            financial_years = db.query(FinancialYear).order_by(FinancialYear.start_date.desc()).all()
            
            category_data = []
            for category_id in category_ids:
                category = db.query(Category).filter(Category.id == category_id).first()
                if category.is_renewal == False:
                    continue
                if not category:
                    return {"status": False, "detail": "Category not found", "data": []}
                answer = db.query(Answer).filter(Answer.category_id == category_id, getattr(Answer, entity["field"]) == entity["id"]).all()
                iter_count = category.renewal_iteration
                if category.type.lower() == "month":
                    period_type = get_period_type(iter_count)
                    periods_data = {}
                    year_data =[]
                    for fy in financial_years:
                        iter_ranges = split_month_ranges_custom(fy.start_date, fy.end_date, iter_count)
                        year_key = fy.year
                        periods_data = {}
                        
                        if answer:
                            answer_data_entries = db.query(AnswerData).filter(
                                AnswerData.active == True,
                                AnswerData.answer_id.in_([answer.id for answer in answer]),
                                AnswerData.start_date >= fy.start_date,
                                AnswerData.end_date <= fy.end_date
                            ).all()
                            uploaded_periods = set()

                            for ad in answer_data_entries:
                                for idx, (start, end) in enumerate(iter_ranges):
                                    if ad.start_date <= end and ad.end_date >= start:
                                        period_name = get_period_name(start, end, iter_count)
                                        uploaded_periods.add(period_name)

                        else:
                            uploaded_periods = set()

                        for idx, (start, end) in enumerate(iter_ranges):
                            period_name = get_period_name(start, end, iter_count)
                            periods_data[period_name] = period_name in uploaded_periods
                        year_data.append({
                            "year": year_key,
                            period_type: periods_data
                        })
                    category_data.append({
                        "category_name": category.name,
                        "period_type": period_type,
                        "category_id": category.id,
                        "year_data": year_data
                    })
                if category.type.lower() == "year":
                    period_type = "years"
                    periods_data = {}
                    for i in range(0, len(financial_years), iter_count):
                        group = financial_years[i:i + iter_count]
                        if not group:
                            continue
                        start_date = group[0].start_date
                        end_date = group[-1].end_date

                        try:
                            start_year = int(group[0].year.split('-')[0])
                            end_year = int(group[-1].year.split('-')[1])
                        except (ValueError, IndexError):
                            return {"status": False, "detail": "Invalid year format in FinancialYear", "data": []}

                        year_key = f"{start_year}-{end_year}" if start_year != end_year else str(start_year)

                        uploaded = db.query(AnswerData).filter(
                            AnswerData.active == True,
                            AnswerData.answer_id.in_([answer.id for answer in answer]),
                            AnswerData.start_date >= start_date,
                            AnswerData.end_date <= end_date
                        ).first() is not None

                        periods_data[year_key] = uploaded

                    category_data.append({
                        "category_name": category.name,
                        "period_type": period_type,
                        "category_id": category.id,
                        period_type: periods_data
                    })

            data.append({
                "community_name": entity["entity_name"],
                "community_type": entity["entity_type"],
                "category_data": category_data,
            })if category_data else None

        return {"status": True, "data": data}
    except Exception as e:
        return {"status": False, "detail": str(e), "data": []}
    
# ------------------------------ portfolio wise report ----------------------------------------------

# Model Configuration

def serialize_model(model_instance):
    if model_instance is None:
        return None
    
    # Handle primitive types
    if isinstance(model_instance, (int, float, str, bool)):
        return model_instance
    
    # Handle dates
    if isinstance(model_instance, date):
        return model_instance.isoformat()
    
    # Handle SQLAlchemy models
    if hasattr(model_instance, '__table__'):
        result = {}
        mapper = class_mapper(model_instance.__class__)
        for column in mapper.columns:
            key = column.name
            value = getattr(model_instance, key)
            
            # Handle relationships
            if column.foreign_keys:
                if value is None:
                    result[key] = None
                elif isinstance(value, list):
                    result[key] = [serialize_model(item) for item in value]
                else:
                    result[key] = serialize_model(value)
            else:
                result[key] = value
        return result
    
    # Handle dictionaries
    if isinstance(model_instance, dict):
        return {k: serialize_model(v) for k, v in model_instance.items()}
    
    # Handle lists
    if isinstance(model_instance, list):
        return [serialize_model(item) for item in model_instance]
    
    # Fallback for other types
    return str(model_instance)

# Model Configuration
MODEL_MAP = {
    "community": {"model": Community, "id_field": "community_id", "type": "non_financial"},
    "society": {"model": Society, "id_field": "society_id", "type": "non_financial"},
    "legalentity": {"model": LegalEntity, "id_field": "legal_entity_id", "type": "non_financial"},
    "cfp": {"model": CFP, "id_field": "cfp_id", "type": "financial"},
    "sfp": {"model": SFP, "id_field": "sfp_id", "type": "financial"},
    "lefp": {"model": LEFP, "id_field": "lefp_id", "type": "financial"},
}
# API Endpoints with proper serialization
@router.get("/ddmWiseUserList")
def ddm_wise_user_list(
    community: bool = False,
    society: bool = False,
    ddm: bool = False,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        if not any([community, society, ddm]):
            return {"status": False, "detail": "Select at least one type (community, society, ddm)"}
        if sum([community, society, ddm]) > 1:
            return {"status": False, "detail": "Select at most one type (community, society, ddm)"}

        if community:
            if curr_user.role_id == secret.s_admin_role:
                query = db.query(Community)
            elif curr_user.role_id == secret.p_admin_role:
                query = db.query(Community).filter(Community.province_id == curr_user.province_id)
            else:
                community_user = db.query(CommunityUser).filter(CommunityUser.user_id == curr_user.user_id).first()
                if not community_user:
                    return {"status": False, "detail": "User is not associated with any community", "data": []}
                if community_user:
                    query = db.query(Community).filter(Community.id == community_user.community_id)
                

            communities = query.all()
            return {
                "status": True,
                "detail": "data fetched successfully",
                "data": [serialize_model(c) for c in communities]
            }

        if society:
            
            if curr_user.role_id == secret.s_admin_role:
                query = db.query(Society)
            elif curr_user.role_id == secret.p_admin_role:
                query = db.query(Society).filter(Society.province_id == curr_user.province_id)
            else:
                society_user = db.query(SocietyUser).filter(SocietyUser.user_id == curr_user.user_id).first()
                if not society_user:
                    return {"status": False, "detail": "User is not associated with any community", "data": []}
                if society_user:
                    query = db.query(Society).filter(Society.id == society_user.society_id)
                

            societies = query.all()
            return {
                "status": True,
                "detail": "data fetched successfully",
                "data": [serialize_model(s) for s in societies]
            }

        if ddm:
            # Get base entities based on user role
            if curr_user.role_id == secret.s_admin_role:
                community_ids = [c.id for c in db.query(Community).all()]
                society_ids = [s.id for s in db.query(Society).all()]
                legal_entity_ids = [l.id for l in db.query(LegalEntity).all()]
            else:
                community_ids = [c.id for c in db.query(Community).filter_by(province_id=curr_user.province_id).all()]
                society_ids = [s.id for s in db.query(Society).filter_by(province_id=curr_user.province_id).all()]
                legal_entity_ids = [l.id for l in db.query(LegalEntity).filter_by(province_id=curr_user.province_id).all()]

            # Get financial entities
            cfp_ids = [x.id for x in db.query(CFP).filter(CFP.community_id.in_(community_ids)).all()]
            sfp_ids = [x.id for x in db.query(SFP).filter(SFP.society_id.in_(society_ids)).all()]
            lefp_ids = [x.id for x in db.query(LEFP).filter(LEFP.legal_entity_id.in_(legal_entity_ids)).all()]

            # Get all related user IDs
            user_models = [
                (CommunityUser, "community_id", community_ids),
                (SocietyUser, "society_id", society_ids),
                (LegalEntityUser, "legal_entity_id", legal_entity_ids),
                (CFPUser, "cfp_id", cfp_ids),
                (SFPUser, "sfp_id", sfp_ids),
                (LEFPUser, "lefp_id", lefp_ids),
            ]

            user_ids = set()
            for model, id_field, ids in user_models:
                if curr_user.role_id == secret.p_admin_role or curr_user.role_id == secret.s_admin_role:
                    user_ids.update(
                        uid for (uid,) in db.query(model.user_id).filter(getattr(model, id_field).in_(ids)).all()
                    )
                else:
                    user_ids.update(
                        uid for (uid,) in db.query(model.user_id).filter(getattr(model, id_field).in_(ids), model.user_id == curr_user.user_id).all()
                    )

            users = db.query(User).filter(User.id.in_(user_ids)).order_by(User.name).all()
            return {
                "status": True,
                "detail": "Users fetched successfully",
                "data": [serialize_model(u) for u in users]
            }

    except Exception as e:
        return {"status": False, "detail": str(e), "data": []}

@router.get("/ddmWisePortfolioList")
def ddm_wise_portfolio_list(
    id: int,
    community: bool = False,
    society: bool = False,
    ddm: bool = False,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        if not any([community, society, ddm]):
            return {"status": False, "detail": "Select at least one type"}
        if sum([community, society, ddm]) > 1:
            return {"status": False, "detail": "Select only one type"}

        portfolios = db.query(Portfolio).all()
        portfolio_data = []
        user_models = [
                    (CommunityUser, "community_id", Community),
                    (CFPUser, "cfp_id", CFP),
                    (SocietyUser, "society_id", Society),
                    (SFPUser, "sfp_id", SFP),
                    (LegalEntityUser, "legal_entity_id", LegalEntity),
                    (LEFPUser, "lefp_id", LEFP),
                ]
        for portfolio in portfolios:
            entities = []
            
            if community:
                community_data = db.query(Community).filter(Community.id == id).first()
                if not community_data:
                    return {"status": False, "detail": "Invalid community ID", "data": []}

                # Check if current user has access to this community
                if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                    user_has_access = db.query(CommunityUser).filter(
                        CommunityUser.community_id == id,
                        CommunityUser.user_id == curr_user.user_id
                    ).first()
                    if not user_has_access:
                        continue

                if portfolio.name.lower() != "community":
                    # Filter CFP entities by user access
                    cfp_query = db.query(CFP).filter(
                        CFP.community_id == id,
                        CFP.portfolio_id == portfolio.id
                    )
                    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                        cfp_ids = [cfp_id[0] for cfp_id in db.query(CFPUser.cfp_id).filter(
                            CFPUser.user_id == curr_user.user_id
                        ).all()]
                        cfp_query = cfp_query.filter(CFP.id.in_(cfp_ids))
                    entities.extend(cfp_query.all())
                    
                    # Filter Society entities by user access
                    society_query = db.query(Society).filter(
                        Society.community_id == id,
                        Society.portfolio_id == portfolio.id
                    )
                    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                        society_ids = [society_id[0] for society_id in db.query(SocietyUser.society_id).filter(
                            SocietyUser.user_id == curr_user.user_id
                        ).all()]
                        society_query = society_query.filter(Society.id.in_(society_ids))
                    entities.extend(society_query.all())
                    
                    # Filter LegalEntity entities by user access
                    legal_entity_query = db.query(LegalEntity).filter(
                        LegalEntity.community_id == id,
                        LegalEntity.portfolio_id == portfolio.id
                    )
                    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                        legal_entity_ids = [legal_entity_id[0] for legal_entity_id in db.query(LegalEntityUser.legal_entity_id).filter(
                            LegalEntityUser.user_id == curr_user.user_id
                        ).all()]
                        legal_entity_query = legal_entity_query.filter(LegalEntity.id.in_(legal_entity_ids))
                    entities.extend(legal_entity_query.all())
                    
                    # Get society and legal entity IDs for SFP and LEFP filtering
                    society_ids = [s.id for s in db.query(Society.id).filter(Society.community_id == id).all()]
                    legal_entity_ids = [l.id for l in db.query(LegalEntity.id).filter(LegalEntity.community_id == id).all()]
                    
                    # Filter SFP entities by user access
                    sfp_query = db.query(SFP).filter(
                        SFP.society_id.in_(society_ids),
                        SFP.portfolio_id == portfolio.id
                    )
                    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                        sfp_ids = [sfp_id[0] for sfp_id in db.query(SFPUser.sfp_id).filter(
                            SFPUser.user_id == curr_user.user_id
                        ).all()]
                        sfp_query = sfp_query.filter(SFP.id.in_(sfp_ids))
                    entities.extend(sfp_query.all())
                    
                    # Filter LEFP entities by user access
                    lefp_query = db.query(LEFP).filter(
                        LEFP.legal_entity_id.in_(legal_entity_ids),
                        LEFP.portfolio_id == portfolio.id
                    )
                    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                        lefp_ids = [lefp_id[0] for lefp_id in db.query(LEFPUser.lefp_id).filter(
                            LEFPUser.user_id == curr_user.user_id
                        ).all()]
                        lefp_query = lefp_query.filter(LEFP.id.in_(lefp_ids))
                    entities.extend(lefp_query.all())
                    
            elif society:
                society_data = db.query(Society).filter(Society.id == id).first()
                if not society_data:
                    return {"status": False, "detail": "Invalid society ID", "data": []}

                # Check if current user has access to this society
                if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                    user_has_access = db.query(SocietyUser).filter(
                        SocietyUser.society_id == id,
                        SocietyUser.user_id == curr_user.user_id
                    ).first()
                    if not user_has_access:
                        continue

                if portfolio.name.lower() not in ["community", "society"]:
                    # Filter SFP entities by user access
                    sfp_query = db.query(SFP).filter(
                        SFP.society_id == id,
                        SFP.portfolio_id == portfolio.id
                    )
                    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                        sfp_ids = [sfp_id[0] for sfp_id in db.query(SFPUser.sfp_id).filter(
                            SFPUser.user_id == curr_user.user_id
                        ).all()]
                        sfp_query = sfp_query.filter(SFP.id.in_(sfp_ids))
                    entities.extend(sfp_query.all())
                    
                    # Filter LegalEntity entities by user access
                    legal_entity_query = db.query(LegalEntity).filter(
                        LegalEntity.society_id == id,
                        LegalEntity.portfolio_id == portfolio.id
                    )
                    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                        legal_entity_ids = [legal_entity_id[0] for legal_entity_id in db.query(LegalEntityUser.legal_entity_id).filter(
                            LegalEntityUser.user_id == curr_user.user_id
                        ).all()]
                        legal_entity_query = legal_entity_query.filter(LegalEntity.id.in_(legal_entity_ids))
                    entities.extend(legal_entity_query.all())
                    
                    legal_entity_ids = [l.id for l in db.query(LegalEntity.id).filter(LegalEntity.society_id == id).all()]
                    
                    # Filter LEFP entities by user access
                    lefp_query = db.query(LEFP).filter(
                        LEFP.legal_entity_id.in_(legal_entity_ids),
                        LEFP.portfolio_id == portfolio.id
                    )
                    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
                        lefp_ids = [lefp_id[0] for lefp_id in db.query(LEFPUser.lefp_id).filter(
                            LEFPUser.user_id == curr_user.user_id
                        ).all()]
                        lefp_query = lefp_query.filter(LEFP.id.in_(lefp_ids))
                    entities.extend(lefp_query.all())

            elif ddm:
                user = db.query(User).filter(User.id == id).first()
                if not user:
                    return {"status": False, "detail": "Invalid DDM User ID", "data": []}

                # For DDM user, get entities they have access to
                for user_model, id_field, entity_model in user_models:
                    related_ids = [rid[0] for rid in db.query(getattr(user_model, id_field))
                                        .filter(user_model.user_id == id)
                                        .all()]
                    if related_ids:
                        entities.extend(
                            db.query(entity_model)
                            .filter(entity_model.id.in_(related_ids), entity_model.portfolio_id == portfolio.id)
                            .all()
                        )

            if entities:
                ent_data = []
                for ent in entities:
                    # Get related location data
                    state_name = None
                    district_name = None
                    region_name = None
                    
                    if hasattr(ent, 'state') and ent.state:
                        state_name = ent.state.name
                    if hasattr(ent, 'district') and ent.district:
                        district_name = ent.district.name
                    if hasattr(ent, 'region') and ent.region:
                        region_name = ent.region.name
                    
                    name = ent.name
                    if portfolio.type.lower() == "financial":
                        
                        if hasattr(ent, 'community'):
                            name = f"{ent.community.name} - {portfolio.name}" 
                        elif hasattr(ent, 'society'):
                            name = f"{ent.society.name} - {portfolio.name}"
                        elif hasattr(ent, 'legal_entity'):
                            name = f"{ent.legal_entity.name} - {portfolio.name}"

                    ent_data.append({
                        "entity_id": ent.id,
                        "entity_code": getattr(ent, "code", None),
                        "entity_place": getattr(ent, "place", None),
                        "entity_address": getattr(ent, "address", None),
                        "state": state_name,
                        "district": district_name,
                        "region": region_name,
                        "name": name,
                        "model": ent.__class__.__name__,
                        "type": getattr(ent, "type", None) if portfolio.type.lower() == "financial" else None
                    })

                portfolio_data.append({
                    "portfolio_id": portfolio.id,
                    "portfolio_name": portfolio.name,
                    "portfolio_entities": ent_data
                })

        return {"status": True, "data": portfolio_data}

    except Exception as e:
        return {"status": False, "detail": str(e), "data": []}

@router.get("/categoryListByEntity")
def category_list_by_entity(
    entity_id: int,
    portfolio_id: int,
    model: str,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        model_config = MODEL_MAP.get(model.lower())
        if not model_config:
            return {"status": False, "detail": f"Invalid model name: {model}", "data": []}

        # Check if entity exists
        entity = db.query(model_config["model"]).filter_by(id=entity_id).first()
        if not entity:
            return {"status": False, "detail": "Invalid entity ID", "data": []}

        # Check if current user has access to this entity
        if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
            # Define user model mapping for access control
            user_model_map = {
                "community": CommunityUser,
                "society": SocietyUser,
                "legalentity": LegalEntityUser,
                "cfp": CFPUser,
                "sfp": SFPUser,
                "lefp": LEFPUser,
            }
            
            user_model = user_model_map.get(model.lower())
            if user_model:
                user_has_access = db.query(user_model).filter(
                    getattr(user_model, model_config["id_field"]) == entity_id,
                    user_model.user_id == curr_user.user_id
                ).first()
                if not user_has_access:
                    return {"status": False, "detail": "Access denied to this entity", "data": []}

        # Check if portfolio exists
        portfolio = db.query(Portfolio).filter_by(id=portfolio_id).first()
        if not portfolio:
            return {"status": False, "detail": "Invalid portfolio ID", "data": []}

        # Get categories for this portfolio
        category_ids = [cid[0] for cid in db.query(PortfolioCategoryMap.category_id)
                                .filter_by(portfolio_id=portfolio_id)
                                .all()]
        
        if not category_ids:
            return {"status": False, "detail": "No categories found for the portfolio", "data": []}

        category_data = []
        for category in db.query(Category).filter(Category.id.in_(category_ids)).all():
            answers = db.query(Answer).filter(
                Answer.category_id == category.id,
                getattr(Answer, model_config["id_field"]) == entity_id
            ).all()
            
            ans_data = []
            for answer in answers:
                for data in db.query(AnswerData).filter_by(answer_id=answer.id,active= True).all():
                    ans_data.append({
                        "id": data.id,
                        "start_date": data.start_date.isoformat() if data.start_date else None,
                        "end_date": data.end_date.isoformat() if data.end_date else None,
                        "answer_data": data.answer_data
                    })

            category_data.append({
                "category_id": category.id,
                "category_type": category.type,
                "is_renewal": category.is_renewal,
                "category_name": category.name,
                "answers": ans_data
            })

        return {"status": True, "data": category_data}

    except Exception as e:
        return {"status": False, "detail": str(e), "data": []}

@router.get("/answerViewByCategory")
def answerViewByCategory(
    entity_id: int,
    category_id: int, 
    model: str, 
    db: Session = Depends(get_db),
    view: bool = False,
    view_overview: bool = False, 
    curr_user: Token = Depends(authenticate)
):
    """
    API endpoint to view answers for a given category and entity.

    Args:
        entity_id (int): ID of the entity to view answers for.
        category_id (int): ID of the category to view answers for.
        model (str): Model name of the entity to view answers for.
        db (Session): SQLAlchemy session object to use for database queries.
        view (bool, optional): If true, returns all answers for the category and entity. Defaults to False.
        view_overview (bool, optional): If true, returns answers in overview view format. Defaults to False.
        curr_user (Token, optional): Current user object. Defaults to Depends(authenticate).

    Returns:
        dict: JSON response with status, detail and data fields.
    """

    try:
        # Validate category exists
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return {"status": False, "detail": "Invalid category ID", "data": []}

        # Get model configuration
        model_config = MODEL_MAP.get(model.lower())
        if not model_config:
            return {"status": False, "detail": f"Invalid model name: {model}", "data": []}

        # Validate entity exists
        entity = db.query(model_config["model"]).filter_by(id=entity_id).first()
        if not entity:
            return {"status": False, "detail": "Invalid entity ID", "data": []}

        # Check if current user has access to this entity
        if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
            # Define user model mapping for access control
            user_model_map = {
                "community": CommunityUser,
                "society": SocietyUser,
                "legalentity": LegalEntityUser,
                "cfp": CFPUser,
                "sfp": SFPUser,
                "lefp": LEFPUser,
            }
            
            user_model = user_model_map.get(model.lower())
            if user_model:
                user_has_access = db.query(user_model).filter(
                    getattr(user_model, model_config["id_field"]) == entity_id,
                    user_model.user_id == curr_user.user_id
                ).first()
                if not user_has_access:
                    return {"status": False, "detail": "Access denied to this entity", "data": []}

        # Get answers for this category and entity
        answers = db.query(Answer).filter(
            Answer.category_id == category.id,
            getattr(Answer, model_config["id_field"]) == entity_id
        ).all()

        # Handle different view modes
        if view_overview:
            return handle_overview_view(db, category, answers)
        elif view:
            return handle_full_view(db, category, answers)
        else:
            return handle_default_view(db, answers)

    except Exception as e:
        return {"status": False, "detail": str(e), "data": []}
# ---------------------- helper function for answerViewByCategory ----------------------
def handle_overview_view(db: Session, category: Category, answers: List[Answer]):
    """
    Helper function for answerViewByCategory, handles overview view mode.
    
    When view_overview is True, this function is called to handle the overview view
    mode. It generates a list of periods (months or years) for which there is data for
    the given category and entity ID. The result is a dictionary with the category name
    and ID, and a list of periods, each period being a dictionary with a year (or
    year range) as key, and a boolean value indicating whether there is data for that
    period or not.
    
    Args:
        db (Session): The database session object.
        category (Category): The category object.
        answers (List[Answer]): The list of answers for this category and entity.
    
    Returns:
        dict: The result dictionary.
    """
    if not category.is_renewal:
        return {"status": False, "detail": "Category is not renewal", "data": []}

    financial_years = db.query(FinancialYear).order_by(FinancialYear.start_date).all()
    result = {
        "category_name": category.name,
        "category_id": category.id,
        "periods": []
    }

    answer_ids = [a.id for a in answers]

    if category.type.lower() == "month":
        iter_count = category.renewal_iteration
        period_type = get_period_type(iter_count)
        result["period_type"] = period_type
        for fy in financial_years:
            periods = split_month_ranges_custom(fy.start_date, fy.end_date, iter_count)
            period_data = {}
            
            for start, end in periods:
                period_name = get_period_name(start, end, iter_count)
                has_data = db.query(AnswerData).filter(
                    AnswerData.active == True,
                    AnswerData.answer_id.in_(answer_ids),
                    AnswerData.start_date >= start,
                    AnswerData.end_date <= end
                ).first() is not None
                
                period_data[period_name] = has_data
            
            result["periods"].append({
                "year": fy.year,
                period_type: period_data
            })

    elif category.type.lower() == "year":
        iter_count = category.renewal_iteration
        grouped_years = [financial_years[i:i+iter_count] for i in range(0, len(financial_years), iter_count)]
        
        for group in grouped_years:
            if not group:
                continue
                
            start_date = group[0].start_date
            end_date = group[-1].end_date
            year_key = format_year_range(group)
            
            has_data = db.query(AnswerData).filter(
                AnswerData.active == True,
                AnswerData.answer_id.in_(answer_ids),
                AnswerData.start_date >= start_date,
                AnswerData.end_date <= end_date
            ).first() is not None
            result["period_type"] = "years"
            result["periods"].append({
                "years": year_key,
                "has_data": has_data
            })

    return {"status": True, "data": result}
def handle_full_view(db: Session, category: Category, answers: List[Answer]):
    """
    Helper function for answerViewByCategory, handles full view mode.
    
    When view is True, this function is called to handle the full view mode. It
    generates a list of periods (months or years) for which there is data for the
    given category and entity ID. The result is a dictionary with the category name
    and ID, and a list of periods, each period being a dictionary with a year (or
    year range) as key, and the answer data as value.
    
    Args:
        db (Session): The database session object.
        category (Category): The category object.
        answers (List[Answer]): The list of answers for this category and entity.
    
    Returns:
        dict: The result dictionary.
    """
    if category.is_renewal:
        financial_years = db.query(FinancialYear).order_by(FinancialYear.start_date).all()
        result = {
            "category_name": category.name,
            "category_id": category.id,
            "periods": []
        }

        answer_ids = [a.id for a in answers]

        if category.type.lower() == "month":
            iter_count = category.renewal_iteration
            period_type = get_period_type(iter_count)
            
            for fy in financial_years:
                periods = split_month_ranges_custom(fy.start_date, fy.end_date, iter_count)
                period_data = {}
                
                for start, end in periods:
                    period_name = get_period_name(start, end, iter_count)
                    answer_data = db.query(AnswerData).filter(
                        AnswerData.active == True,
                        AnswerData.answer_id.in_(answer_ids),
                        AnswerData.start_date >= start,
                        AnswerData.end_date <= end
                    ).first()
                    
                    period_data[period_name] = answer_data if answer_data else None

                
                result["periods"].append({
                    "year": fy.year,
                    period_type: period_data
                })

        elif category.type.lower() == "year":
            iter_count = category.renewal_iteration
            grouped_years = [financial_years[i:i+iter_count] for i in range(0, len(financial_years), iter_count)]
            
            for group in grouped_years:
                if not group:
                    continue
                    
                start_date = group[0].start_date
                end_date = group[-1].end_date
                year_key = format_year_range(group)
                
                answer_data = db.query(AnswerData).filter(
                    AnswerData.active == True,
                    AnswerData.answer_id.in_(answer_ids),
                    AnswerData.start_date >= start_date,
                    AnswerData.end_date <= end_date
                ).first()
                
                result["periods"].append({
                    "years": year_key,
                    "data": answer_data if answer_data else None
                })

        return {"status": True, "data": result}
    else:
        answer_data = []
        for answer in answers:
            data = db.query(AnswerData).filter(AnswerData.answer_id == answer.id,AnswerData.active == True).all()
            answer_data.extend([data])
        return {
            "status": True,
            "data": {
                "category_name": category.name,
                "category_id": category.id,
                "answers": answer_data
            }
        }
def handle_default_view(db: Session, answers: List[Answer]):
    """
    Retrieves the default view of answer data for a given list of answers.

    :param db: SQLAlchemy database session
    :param answers: List of Answer objects to retrieve data for
    :return: A JSON response with the answer data

    The default view is the most recent answer data for each answer. This
    is determined by finding the AnswerData records with the highest ID
    for each answer. The returned data is a list of dictionaries with the
    answer data and the ID of the corresponding AnswerData record.
    """
   
    answer_data = []
    for answer in answers:
        data = db.query(AnswerData).filter(
            AnswerData.active == True,
            AnswerData.answer_id == answer.id,
            AnswerData.end_date == None
        ).all()
        
        answer_data.extend(data)
    
    return {"status": True, "data": answer_data}
def get_period_type(iter_count: int) -> str:
    """
    Determine the period type based on the iteration count.

    Args:
        iter_count (int): The number of iterations corresponding to a specific period type.

    Returns:
        str: A string representing the period type, which can be "months", "quarters", 
             "half_years", or "custom_periods" for iteration counts of 1, 3, 6, and others, respectively.
    """

    if iter_count == 1:
        return "months"
    elif iter_count == 3:
        return "quarters"
    elif iter_count == 6:
        return "half_years"
    return "custom_periods"
def format_year_range(year_group: List[FinancialYear]) -> str:
    """
    Formats a list of FinancialYear objects into a year range string.

    Args:
        year_group (List[FinancialYear]): A list of FinancialYear objects.

    Returns:
        str: A string representing the year range, e.g. "2020-2021" or "2020" if the range is a single year.
        If the input list is empty or contains invalid year strings, returns "Invalid year range".
    """
    try:
        start_year = int(year_group[0].year.split('-')[0])
        end_year = int(year_group[-1].year.split('-')[1])
        return f"{start_year}-{end_year}" if start_year != end_year else str(start_year)
    except (ValueError, IndexError):
        return "Invalid year range"
#---------------------------------------------------------------------------------------
