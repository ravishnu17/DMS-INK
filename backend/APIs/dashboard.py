from fastapi import APIRouter, Depends, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session,joinedload,aliased
from sqlalchemy import func
from settings.db import get_db
from typing import List,Optional
from models.configuration import (Community,Society,Portfolio,LegalEntity,CFP,SFP,LEFP,CFPUser,SFPUser,LEFPUser,CommunityUser,SocietyUser,LegalEntityUser)
from schemas.access_control import Token
from models.access_control import User 
from collections import Counter,defaultdict
from models.category import Category,FinancialYear, PortfolioCategoryMap
from schemas.dashboard import ResponseSchema,PendingUploadSchema,PendingGroupSchema,RenewalChartDataSchema,RenewalChartDataItem
from models.answers import Answer, AnswerData
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta
from models.notification import Notification
from models.configuration import LegalEntityUser,LegalEntity



from settings.auth import authenticate, verify_pwd, genToken, encrypt, authAdmin,decode_token
from settings.config import secret
# from constants.constant import get_last_month_range,get_last_quarter_range
from constants.mail_layout import forgot_password_html,update_pasword
from datetime import datetime,timedelta
from settings.auth import access_token_forgot_password,verify_action_token

router= APIRouter(
    prefix="/toatl-count",
    tags=["Dashboard"]
)

@router.get("/province-stats")
def get_province_statistics(province: int = 0, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    try:
        non_financial_counts = []
        portfolio= db.query(Portfolio).filter(Portfolio.type=='Non Financial').all()
        portfolio_count = db.query(Portfolio).count()
        legal_entity_counts= {}

        if curr_user.role_id == secret.s_admin_role:
            # Show all data (no province filter)
            society = db.query(Society).count()
            community = db.query(Community).count()
            ddm = db.query(User).filter(User.role_id == 3).count()
            
            non_financial_counts = [{"name": name, "count": str(count)} for name, count in legal_entity_counts.items()]
            for i in portfolio:
                if i.name.lower() == "community":
                    legal_entity_counts["Community"] = db.query(Community).count()
                elif i.name.lower() == "society":
                    legal_entity_counts["Society"] = db.query(Society).count()
                else:
                    legal_entity_counts[i.name] = db.query(LegalEntity).count()


        elif curr_user.role_id == secret.p_admin_role:
            # Filter by province
            society = db.query(Society).filter(Society.province_id == province).count()
            community = db.query(Community).filter(Community.province_id == province).count()
            ddm = db.query(User).filter(User.role_id == 3, User.province_id == province).count()
            legal_entity_counts= {}
            for i in portfolio:
                if i.name.lower() == "community":
                    legal_entity_counts["Community"] = db.query(Community).filter(Community.province_id == province).count()
                elif i.name.lower() == "society":
                    legal_entity_counts["Society"] = db.query(Society).filter(Society.province_id == province).count()
                else:
                    legal_entity_counts[i.name] = db.query(LegalEntity).filter(LegalEntity.portfolio_id == i.id, LegalEntity.province_id == province).count()

            non_financial_counts = [{"name": name, "count": str(count)} for name, count in legal_entity_counts.items()]

        else:
            # Only show entities assigned to the user (as in your original else block)
            # ...existing code for user-based filtering...
            com_users = db.query(CommunityUser).filter(CommunityUser.user_id == curr_user.user_id).all()
            cpf_users = db.query(CFPUser).filter(CFPUser.user_id == curr_user.user_id).all()
            com_ids = {cu.community_id for cu in com_users}
            com_ids.update(cu.cfp.community_id for cu in cpf_users if cu.cfp and hasattr(cu.cfp, 'community_id'))
            non_financial_counts.append({
                "name": "Community",
                "count": str(len(com_ids))
            })

            soc_users = db.query(SocietyUser).filter(SocietyUser.user_id == curr_user.user_id).all()
            sfp_users = db.query(SFPUser).filter(SFPUser.user_id == curr_user.user_id).all()
            soc_ids = {su.society_id for su in soc_users}
            soc_ids.update(su.sfp.society_id for su in sfp_users if su.sfp and hasattr(su.sfp, 'society_id'))
            non_financial_counts.append({
                "name": "Society",
                "count": str(len(soc_ids))
            })

            for port in portfolio:
                if port.name in ['Community', 'Society']:
                    continue
                leg_users = db.query(LegalEntityUser).join(LegalEntity).filter(
                    LegalEntityUser.user_id == curr_user.user_id,
                    LegalEntity.portfolio_id == port.id
                ).all()
                lefp_users = db.query(LEFPUser).join(LEFP).filter(
                    LEFPUser.user_id == curr_user.user_id,
                    LEFP.portfolio_id == port.id
                ).all()
                leg_ids = {lu.lefp.legal_entity_id for lu in lefp_users if lu.lefp and hasattr(lu.lefp, 'legal_entity_id')}
                leg_ids.update(lu.legal_entity_id for lu in leg_users)
                non_financial_counts.append({
                    "name": port.name,
                    "count": str(len(leg_ids))
                })

            # DDM and portfolio counts for assigned entities
            ddm = 0  # You can add logic for DDM if needed
            society = len(soc_ids)
            community = len(com_ids)

        return {
            "status": True,
            "details": "fetching the all totals",
            "province": province,
            "no_of_societies": society,
            "no_of_communities": community,
            "no_of_ddms": ddm,
            "no_of_portfolios": portfolio_count,
            "nonFinancialCounts": non_financial_counts
        }

    except Exception as e:
        return {
            "status": False,
            "details": f"Error while fetching statistics: {str(e)}"
        }


#Pending Document Count
@router.get("/dashboard/pending-documents", response_model=ResponseSchema)
def get_pending_documents(province_id: int, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    try:
        monthly_pending = []
        quarterly_pending = []
        half_yearly_pending = []
        annual_pending = []

        portfolio= db.query(Portfolio).filter(Portfolio.type=='Non Financial').all()
        portfolio_models= {}
        for i in portfolio:
            if i.name.lower() == "community":
                portfolio_models["Community"] = (Answer.community_id, Community, 1)
            elif i.name.lower() == "society":
                portfolio_models["Society"] = (Answer.society_id, Society, 2)
            else:
                portfolio_models[i.name] = (Answer.legal_entity_id, LegalEntity, i.id)
        # portfolio_models = {
        #     "Community": (Answer.community_id, Community, 1),
        #     "Society": (Answer.society_id, Society, 2),
        #     "Parish": (Answer.legal_entity_id, LegalEntity, 3),
        #     "School": (Answer.legal_entity_id, LegalEntity, 4),
        #     "College": (Answer.legal_entity_id, LegalEntity, 5),
        #     "Technical Institutions": (Answer.legal_entity_id, LegalEntity, 6),
        #     "Boarding and Hostel": (Answer.legal_entity_id, LegalEntity, 7),
        #     "Departments": (Answer.legal_entity_id, LegalEntity, 8),
        #     "Social Sectors": (Answer.legal_entity_id, LegalEntity, 9),
        #     "Companies": (Answer.legal_entity_id, LegalEntity, 10),
        # }

        def get_entity_name(obj):
            return getattr(obj, "name", "Unknown")

        monthly_counts_by_portfolio = Counter()
        quarterly_counts_by_portfolio = Counter()
        half_yearly_counts_by_portfolio = Counter()
        annual_counts_by_portfolio = Counter()

        user_id = curr_user.user_id

        for portfolio_name, (field, model, portfolio_id) in portfolio_models.items():
            monthly_cats = db.query(Category).join(PortfolioCategoryMap).filter(
                PortfolioCategoryMap.portfolio_id == portfolio_id,
                Category.province_id == province_id,
                Category.active == True,
                Category.is_renewal == True,
                Category.renewal_iteration == 1,
                Category.type == "Month"
            ).all()

            quarterly_cats = db.query(Category).join(PortfolioCategoryMap).filter(
                PortfolioCategoryMap.portfolio_id == portfolio_id,
                Category.province_id == province_id,
                Category.active == True,
                Category.is_renewal == True,
                Category.renewal_iteration == 3,
                Category.type == "Month"
            ).all()

            half_yearly_cats = db.query(Category).join(PortfolioCategoryMap).filter(
                PortfolioCategoryMap.portfolio_id == portfolio_id,
                Category.province_id == province_id,
                Category.active == True,
                Category.is_renewal == True,
                Category.renewal_iteration == 6,
                Category.type == "Month"
            ).all()

            annual_cats = db.query(Category).join(PortfolioCategoryMap).filter(
                PortfolioCategoryMap.portfolio_id == portfolio_id,
                Category.province_id == province_id,
                Category.active == True,
                Category.is_renewal == True,
                Category.type == "Year"
            ).all()

            # Role-based entity filtering
            if curr_user.role_id == secret.s_admin_role:
                entities = db.query(model).filter(
                    model.portfolio_id == portfolio_id if model == LegalEntity else True,
                  
                ).all()
            elif curr_user.role_id == secret.p_admin_role:
                entities = db.query(model).filter(
                    model.portfolio_id == portfolio_id if model == LegalEntity else True,
                    model.province_id == province_id
                ).all()
            else:
                if model == Community:
                    community_ids = [cu.community_id for cu in db.query(CommunityUser).filter(CommunityUser.user_id == user_id).all()]
                    entities = db.query(Community).filter(
                        Community.province_id == province_id,
                        Community.id.in_(community_ids)
                    ).all()
                elif model == Society:
                    society_ids = [su.society_id for su in db.query(SocietyUser).filter(SocietyUser.user_id == user_id).all()]
                    entities = db.query(Society).filter(
                        Society.province_id == province_id,
                        Society.id.in_(society_ids)
                    ).all()
                elif model == LegalEntity:
                    leg_ids = set()
                    leg_users = db.query(LegalEntityUser).join(LegalEntity).filter(
                        LegalEntityUser.user_id == user_id,
                        LegalEntity.portfolio_id == portfolio_id
                    ).all()
                    lefp_users = db.query(LEFPUser).join(LEFP).filter(
                        LEFPUser.user_id == user_id,
                        LEFP.portfolio_id == portfolio_id
                    ).all()
                    leg_ids.update(lu.lefp.legal_entity_id for lu in lefp_users if lu.lefp and hasattr(lu.lefp, 'legal_entity_id'))
                    leg_ids.update(lu.legal_entity_id for lu in leg_users)
                    entities = db.query(LegalEntity).filter(
                        LegalEntity.province_id == province_id,
                        LegalEntity.portfolio_id == portfolio_id,
                        LegalEntity.id.in_(leg_ids)
                    ).all()
                else:
                    entities = []

            for entity in entities:
                for cat in monthly_cats:
                    query = db.query(Answer).filter(
                        Answer.category_id == cat.id,
                        Answer.cfp_id == None,
                        Answer.sfp_id == None,
                        Answer.lefp_id == None,
                        field == entity.id
                    )
                    if not db.query(query.exists()).scalar():
                        monthly_pending.append(f"{portfolio_name}: {get_entity_name(entity)} - {cat.name}")
                        monthly_counts_by_portfolio[portfolio_name] += 1

                for cat in quarterly_cats:
                    query = db.query(Answer).filter(
                        Answer.category_id == cat.id,
                        Answer.cfp_id == None,
                        Answer.sfp_id == None,
                        Answer.lefp_id == None,
                        field == entity.id
                    )
                    if not db.query(query.exists()).scalar():
                        quarterly_pending.append(f"{portfolio_name}: {get_entity_name(entity)} - {cat.name}")
                        quarterly_counts_by_portfolio[portfolio_name] += 1

                for cat in half_yearly_cats:
                    query = db.query(Answer).filter(
                        Answer.category_id == cat.id,
                        Answer.cfp_id == None,
                        Answer.sfp_id == None,
                        Answer.lefp_id == None,
                        field == entity.id
                    )
                    if not db.query(query.exists()).scalar():
                        half_yearly_pending.append(f"{portfolio_name}: {get_entity_name(entity)} - {cat.name}")
                        half_yearly_counts_by_portfolio[portfolio_name] += 1
                        
                for cat in annual_cats:
                    query = db.query(Answer).filter(
                        Answer.category_id == cat.id,
                        Answer.cfp_id == None,
                        Answer.sfp_id == None,
                        Answer.lefp_id == None,
                        field == entity.id
                    )
                    if not db.query(query.exists()).scalar():
                        annual_pending.append(f"{portfolio_name}: {get_entity_name(entity)} - {cat.name}")
                        annual_counts_by_portfolio[portfolio_name] += 1


        total_monthly_pending = len(monthly_pending)
        total_quarterly_pending = len(quarterly_pending)
        total_half_yearly_pending = len(half_yearly_pending)
        total_annual_pending = len(annual_pending)
        

        
        grand_total_pending = total_monthly_pending + total_quarterly_pending + total_half_yearly_pending + total_annual_pending

        chart_data = []
        portfolio_summary = []

        for portfolio_name in portfolio_models.keys():
            monthly = monthly_counts_by_portfolio.get(portfolio_name, 0)
            quarterly = quarterly_counts_by_portfolio.get(portfolio_name, 0)
            half_yearly = half_yearly_counts_by_portfolio.get(portfolio_name, 0)
            annual = annual_counts_by_portfolio.get(portfolio_name, 0)
            chart_data.append({
                "portfolio": portfolio_name,
                "pending_count": monthly + quarterly + half_yearly + annual
            })
            portfolio_summary.append({
                "portfolio": portfolio_name,
                "monthly_pending": monthly,
                "half_yearly_pending": half_yearly,
                "annual_pending": annual,
                "quarterly_pending": quarterly,
                "total": monthly + quarterly + half_yearly + annual
            })

        chart_data.extend([
            {"portfolio": "Total Monthly Pending", "pending_count": total_monthly_pending},
            {"portfolio": "Total Quarterly Pending", "pending_count": total_quarterly_pending},
            {"portfolio": "Total Half Yearly Pending", "pending_count": total_half_yearly_pending},
            {"portfolio": "Total Annual Pending", "pending_count": total_annual_pending},
            {"portfolio": "Grand Total Pending", "pending_count": grand_total_pending}
        ])

        response_data = PendingUploadSchema(
            monthly_pending=PendingGroupSchema(entries=monthly_pending , total=total_monthly_pending),
            quarterly_pending=PendingGroupSchema(entries=quarterly_pending, total=total_quarterly_pending),
            portfolio_pending_data=chart_data,
            total_monthly_pending=total_monthly_pending,
            total_quarterly_pending=total_quarterly_pending,
            grand_total_pending=grand_total_pending,
            portfolio_summary=portfolio_summary
        )

        return ResponseSchema(status=True, details="Pending documents fetched", data=[response_data])

    except Exception as e:
        return ResponseSchema(status=False, details=str(e), data=[])

#Tabular data
@router.get("/dashboard/community-renewal-table", response_model=ResponseSchema)
def get_community_renewal_table(
    province_id: int,
    community_search: Optional[str] = Query(None),
    category_search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        table_data = []
        now = datetime.utcnow()
        next_30_days = now + timedelta(days=30)
        user_id = curr_user.user_id

        # Fetch all active renewal categories for Community (portfolio_id = 1)
        category_query = db.query(Category).join(PortfolioCategoryMap).filter(
            PortfolioCategoryMap.portfolio_id == 1,
            Category.province_id == province_id,
            Category.active == True,
            Category.is_renewal == True
        )
        if category_search:
            category_query = category_query.filter(Category.name.ilike(f"%{category_search}%"))
        categories = category_query.all()

        # Fetch all communities under this province

        community_query = db.query(Community)
        if curr_user.role_id == secret.s_admin_role:
            community_query = community_query
        elif curr_user.role_id == secret.p_admin_role:
            community_query = community_query.filter(Community.province_id == province_id)
        else:
            community_ids = [cu.community_id for cu in db.query(CommunityUser).filter(CommunityUser.user_id == user_id).all()]
            community_query = community_query.filter(Community.id.in_(community_ids), Community.province_id == province_id)
            
        if community_search:
            community_query = community_query.filter(Community.name.ilike(f"%{community_search}%"))
        communities = community_query.all()

        INCHARGE_ROLE_ID = 3  # Update this as needed

        for community in communities:
            category_details = []
            submitted_count = 0

            for cat in categories:
                answer_exists = db.query(Answer).filter(
                    Answer.category_id == cat.id,
                    Answer.community_id == community.id
                ).first()

                if answer_exists:
                    submitted_count += 1
                    status = "Submitted"
                else:
                    status = "Pending"

                    # Calculate next due date
                    next_due = None
                    if cat.type == "Month":
                        today = datetime.utcnow()
                        year = today.year
                        month = today.month + cat.renewal_iteration
                        while month > 12:
                            month -= 12
                            year += 1
                        next_due = datetime(year, month, 1)
                    elif cat.type == "Year":
                        year = now.year + cat.renewal_iteration
                        next_due = datetime(year, 1, 1)

                    if curr_user.role_id == 2 and next_due and now <= next_due <= next_30_days:
                        message = f"The document '{cat.name}' is due for renewal by {next_due.date()} for {community.name}"
                        title = f"Renewal Reminder: {cat.name}"

                        # Admin notification
                        exists_admin = db.query(Notification).filter(
                            Notification.user_id == user_id,
                            Notification.title == title,
                            Notification.message == message
                        ).first()
                        if not exists_admin:
                            db.add(Notification(
                                user_id=user_id,
                                title=title,
                                message=message
                            ))

                        # Incharge notification
                        incharge_mapping = db.query(CommunityUser).filter(
                            CommunityUser.community_id == community.id,
                            CommunityUser.role_id == INCHARGE_ROLE_ID
                        ).first()
                        if incharge_mapping:
                            incharge_id = incharge_mapping.user_id
                            exists_incharge = db.query(Notification).filter(
                                Notification.user_id == incharge_id,
                                Notification.title == title,
                                Notification.message == message
                            ).first()
                            if not exists_incharge:
                                db.add(Notification(
                                    user_id=incharge_id,
                                    title=title,
                                    message=message
                                ))

                category_details.append({
                    "category_name": cat.name,
                    "status": status
                })

            table_data.append({
                "community_name": community.name,
                "total_renewal_count": submitted_count,
                "total_pending_count": len(categories) - submitted_count,
                "categories": category_details
            })

        # Sort the table data by total_pending_count in descending order
        table_data.sort(key=lambda x: x["total_pending_count"], reverse=True)

        db.commit()

        return ResponseSchema(
            status=True,
            details="Community document data fetched",
            data=table_data
        )

    except Exception as e:
        db.rollback()
        return ResponseSchema(status=False, details=f"Error: {str(e)}", data=[])



#for month and year of total count  
@router.get("/dashboard/upcoming-renewal-chart-data", response_model=RenewalChartDataSchema)
def get_upcoming_renewal_chart_data(
    province_id: int,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        portfolio= db.query(Portfolio).filter(Portfolio.type=='Non Financial').all()
        non_financial_models= {}
        for i in portfolio:
            if i.name.lower() == "community":
                non_financial_models["Community"] = (Answer.community_id, Community, 1)
            elif i.name.lower() == "society":
                non_financial_models["Society"] = (Answer.society_id, Society, 2)
            else:
                non_financial_models[i.name] = (Answer.legal_entity_id, LegalEntity, i.id)
        
        # non_financial_models = {
        #     "Community": (Answer.community_id, Community, 1),
        #     "Society": (Answer.society_id, Society, 2),
        #     "Parish": (Answer.legal_entity_id, LegalEntity, 3),
        #     "School": (Answer.legal_entity_id, LegalEntity, 4),
        #     "College": (Answer.legal_entity_id, LegalEntity, 5),
        #     "Technical Institutions": (Answer.legal_entity_id, LegalEntity, 6),
        #     "Boarding and Hostel": (Answer.legal_entity_id, LegalEntity, 7),
        #     "Departments": (Answer.legal_entity_id, LegalEntity, 8),
        #     "Social Sectors": (Answer.legal_entity_id, LegalEntity, 9),
        #     "Companies": (Answer.legal_entity_id, LegalEntity, 10),
        # }

        renewal_type_map = {
            1: "monthly",
            3: "quarterly",
            6: "half_yearly",  
            # Annual will be handled based on category.type == "Year"
        }

        chart_data = []
        now = datetime.now(timezone.utc)
        user_id = curr_user.user_id

        for portfolio_name, (fk_field, model, portfolio_id) in non_financial_models.items():
            data = {
                "portfolio": portfolio_name,
                "monthly": 0,
                "quarterly": 0,
                "half_yearly": 0,  
                "annual": 0
            }

            # Role-based entity filtering
            if curr_user.role_id == secret.s_admin_role:
                entities = db.query(model).filter(
                    model.portfolio_id == portfolio_id if model == LegalEntity else True,
                ).all()
            elif curr_user.role_id == secret.p_admin_role:
                entities = db.query(model).filter(
                    model.portfolio_id == portfolio_id if model == LegalEntity else True,
                    model.province_id == province_id
                ).all()
            else:
                # Filter entities based on user mapping
                if model == Community:
                    community_ids = [cu.community_id for cu in db.query(CommunityUser).filter(CommunityUser.user_id == user_id).all()]
                    entities = db.query(Community).filter(
                        Community.province_id == province_id,
                        Community.id.in_(community_ids)
                    ).all()
                elif model == Society:
                    society_ids = [su.society_id for su in db.query(SocietyUser).filter(SocietyUser.user_id == user_id).all()]
                    entities = db.query(Society).filter(
                        Society.province_id == province_id,
                        Society.id.in_(society_ids)
                    ).all()
                elif model == LegalEntity:
                    # Get LegalEntity IDs from both LegalEntityUser and LEFPUser
                    leg_ids = set()
                    leg_users = db.query(LegalEntityUser).join(LegalEntity).filter(
                        LegalEntityUser.user_id == user_id,
                        LegalEntity.portfolio_id == portfolio_id
                    ).all()
                    lefp_users = db.query(LEFPUser).join(LEFP).filter(
                        LEFPUser.user_id == user_id,
                        LEFP.portfolio_id == portfolio_id
                    ).all()
                    leg_ids.update(lu.lefp.legal_entity_id for lu in lefp_users if lu.lefp and hasattr(lu.lefp, 'legal_entity_id'))
                    leg_ids.update(lu.legal_entity_id for lu in leg_users)
                    entities = db.query(LegalEntity).filter(
                        LegalEntity.province_id == province_id,
                        LegalEntity.portfolio_id == portfolio_id,
                        LegalEntity.id.in_(leg_ids)
                    ).all()
                else:
                    entities = []

            for renewal_int, label in renewal_type_map.items():
                categories = db.query(Category).join(PortfolioCategoryMap).filter(
                    PortfolioCategoryMap.portfolio_id == portfolio_id,
                    Category.province_id == province_id,
                    Category.active == True,
                    Category.is_renewal == True,
                    Category.renewal_iteration == renewal_int
                ).all()

                for entity in entities:
                    for cat in categories:
                        # Get latest answer
                        answer = db.query(Answer).filter(
                            Answer.category_id == cat.id,
                            Answer.cfp_id == None,
                            Answer.sfp_id == None,
                            Answer.lefp_id == None,
                            fk_field == entity.id
                        ).order_by(Answer.updated_at.desc()).first()

                        if answer and answer.updated_at:
                            last_submission_date = answer.updated_at

                            # Determine due date
                            if cat.type == "Month":
                                if renewal_int == 1:
                                    due_date = last_submission_date + relativedelta(months=1)
                                elif renewal_int == 3:
                                    due_date = last_submission_date + relativedelta(months=3)
                                elif renewal_int == 6:
                                    due_date = last_submission_date + relativedelta(months=6)
                            elif cat.type == "Year":
                                due_date = last_submission_date + relativedelta(years=1)
                            else:
                                continue  # Unknown type

                            # Check upcoming
                            if now < due_date <= now + timedelta(days=7):
                                if cat.type == "Month":
                                    if renewal_int == 1:
                                        data["monthly"] += 1
                                    elif renewal_int == 3:
                                        data["quarterly"] += 1
                                    elif renewal_int == 6:
                                        data["half_yearly"] += 1
                                elif cat.type == "Year":
                                    data["annual"] += 1
                        else:
                            # No previous submission, consider upcoming as pending
                            if cat.type == "Month":
                                if renewal_int == 1:
                                    data["monthly"] += 1
                                elif renewal_int == 3:
                                    data["quarterly"] += 1
                                elif renewal_int == 6:
                                    data["half_yearly"] += 1
                            elif cat.type == "Year":
                                data["annual"] += 1

            chart_data.append(RenewalChartDataItem(**data))

        return RenewalChartDataSchema(
            status=True,
            details="Upcoming Renewal Documents fetched",
            total_count=len(chart_data),
            data=chart_data
        )

    except Exception as e:
        return RenewalChartDataSchema(status=False, details=str(e), data=[], total_count=0)
