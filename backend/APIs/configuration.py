from fastapi import APIRouter, Depends,HTTPException,UploadFile, File
from sqlalchemy.orm import Session, joinedload, load_only
from sqlalchemy import func,or_,select
from settings.db import get_db
from settings.auth import authenticate
from schemas.access_control import Token
from models.answers import Answer, AnswerData
from models.access_control import Country, State, Region, District, User, Role
from models.configuration import Portfolio, FinancialPortfolioMap , Community, CommunityUser, CFP, CFPUser, Society, SocietyUser, SFP, SFPUser, LegalEntity, LegalEntityUser, LEFP, LEFPUser,Diocese
from schemas.configuration import (EntityPortfolioUpdateSchema,PortfolioSchema, ResponseModel, FinancialPortfolioMapSchema, CommunitySchema, CommunityResponse, SocietySchema, SocietyResponse, 
    DioceseSchema, LegalEntitySchema, LegalEntityResponse, DioceseOptionsSchema, CommunityOptionSchema, UpdateUsersSchema)
from models.category import Category
from constants.constant import limit_count, get_new_code, mapped_financial, authenticate_permission, get_province_locations, check_locations,validate_identifier,FORMAT_HINTS
from settings.config import secret
from datetime import datetime
import pandas as pd
from fastapi.responses import StreamingResponse
import io
from io import BytesIO
from models.notification import Notification


router = APIRouter(
    prefix="/config",
    tags=["Configuration"]
)


# portfolio type
@router.get('/portfolioType')
def list_portfolioType():
    portfolio_type= [
        {'label': 'Non Financial', 'value': 'Non Financial'},
        {'label': 'Financial', 'value': 'Financial'}

    ]
    return { "status": True,"details":"Portfolio types fetched successfully","data": portfolio_type }

# List and filter portfolios
@router.get('/portfolio', response_model=ResponseModel)
def list_portfolios(skip: int= 0, limit: int= limit_count, type: str= None,search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query= db.query(Portfolio).order_by(Portfolio.id.asc())

    if type:
        query= query.filter(Portfolio.type == type)

    if search:
        query= query.filter(func.lower(Portfolio.name).contains(search.lower()) | 
            func.lower(Portfolio.type).contains(search.lower())
        )

    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()

    return { "status": True,"details":"Portfolios fetched successfully","data": data, "total_count": total_count }

# add new portfolio
@router.post('/portfolio', response_model=ResponseModel)
def add_portfolio(portfolio:PortfolioSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    portfolio_data= Portfolio(**portfolio.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id)
    db.add(portfolio_data)
    db.commit()
    db.refresh(portfolio_data)
    return { "status": True,"details":"Portfolio added successfully","data": portfolio_data }

# edit portfolio
@router.put('/portfolio/{id}')
def edit_portfolio(id:int, portfolio:PortfolioSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    portfolio_data= db.query(Portfolio).filter(Portfolio.id == id)
    if not portfolio_data.first():
        return ResponseModel(status=False, details="Portfolio not found")
    portfolio_data.update({**portfolio.model_dump(), "updated_by": curr_user.user_id}, synchronize_session= False)
    db.commit()
    return { "status": True,"details":"Portfolio updated successfully" }

# delete portfolio
@router.delete('/portfolio/{id}')
def delete_portfolio(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    portfolio_data= db.query(Portfolio).filter(Portfolio.id == id)
    if not portfolio_data.first():
        return ResponseModel(status=False, details="Portfolio not found")
    portfolio_data.delete(synchronize_session= False)
    db.commit()
    return { "status": True,"details":"Portfolio deleted successfully" }

# get non financial and financial mapp menu
@router.get('/financial_map/{portfolio_id}')
def get_financial_map(portfolio_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    data, total= mapped_financial(db, portfolio_id)
    return { "status": True,"details":"Financial Map fetched successfully","data": data, "total_count": total }

# Add non financial and financial mapp menu
@router.post('/financial_map/')
def add_financial_map(data: FinancialPortfolioMapSchema , db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    existing_financial_ids= set(i.financial_portfolio_id for i in db.query(FinancialPortfolioMap).filter(FinancialPortfolioMap.non_financial_portfolio_id == data.non_financial_portfolio_id).all())
    new_financial_ids= set(data.financial_portfolio_id)

    delete_ids= existing_financial_ids - new_financial_ids
    add_ids= new_financial_ids - existing_financial_ids
    entity_financial_mapp= []
    delete_entity_financial_mapp= []
    mapping_has_data= False
    
    if data.non_financial_portfolio_id == secret.community_id:
        for community in db.query(Community).options(load_only(Community.id)).all():
            entity_financial_mapp.extend([CFP(community_id= community.id, portfolio_id= j) for j in add_ids])

            for financial_delete_id in delete_ids: # iterate delete id to get which portfolio is mapped and category name to find the data and show error
                cfp_ids= [ cfp_id[0] for cfp_id in db.query(CFP.id).filter(CFP.community_id == community.id, CFP.portfolio_id == financial_delete_id).all()]
                cfp_name= db.query(Portfolio).filter(Portfolio.id == financial_delete_id).first().name
                # check if any mapping has data
                mapping_has_data= db.query(Answer.id).filter(Answer.cfp_id.in_(cfp_ids), Answer.active == True).scalar_subquery()
                mapping_has_data= db.query(AnswerData.id).filter(AnswerData.answer_id.in_(mapping_has_data), AnswerData.active == True).first()
                # update delete id in delete_entity_financial_mapp
                delete_entity_financial_mapp.extend(cfp_ids)
                if mapping_has_data: # throw error if any mapping has data
                    category_names= [category_name[0] for category_name in db.query(Category.name).filter(Category.id.in_(db.query(Answer.category_id).filter(Answer.cfp_id.in_(cfp_ids), Answer.active == True).scalar_subquery())).all()]
                    return ResponseModel(status=False, details=f"Cannot delete: Community with {cfp_name} has data in Category - {', '.join(category_names)}")
    elif data.non_financial_portfolio_id == secret.society_id:
        for society in db.query(Society).options(load_only(Society.id)).all():
            entity_financial_mapp.extend([SFP(society_id= society.id, portfolio_id= j) for j in add_ids])

            for financial_delete_id in delete_ids:
                sfp_ids= [sfp_id[0] for sfp_id in db.query(SFP.id).filter(SFP.society_id == society.id, SFP.portfolio_id == financial_delete_id).all()]
                sfp_name= db.query(Portfolio).filter(Portfolio.id == financial_delete_id).first().name

                mapping_has_data= db.query(Answer.id).filter(Answer.sfp_id.in_(sfp_ids), Answer.active == True).scalar_subquery()
                mapping_has_data= db.query(AnswerData.id).filter(AnswerData.answer_id.in_(mapping_has_data), AnswerData.active == True).first()

                delete_entity_financial_mapp.extend(sfp_ids)
                if mapping_has_data:
                    category_names= [category_name[0] for category_name in db.query(Category.name).filter(Category.id.in_(db.query(Answer.category_id).filter(Answer.sfp_id.in_(sfp_ids), Answer.active == True).scalar_subquery())).all()]
                    return ResponseModel(status=False, details=f"Cannot delete: Society with {sfp_name} has data in Category - {', '.join(category_names)}") 
    else:
        for legal_entity in db.query(LegalEntity).options(load_only(LegalEntity.id)).filter(LegalEntity.portfolio_id == data.non_financial_portfolio_id).all():
            entity_financial_mapp.extend([LEFP(legal_entity_id= legal_entity.id, portfolio_id= j) for j in add_ids])
            entity_name= db.query(Portfolio).filter(Portfolio.id == data.non_financial_portfolio_id).first().name
            for financial_delete_id in delete_ids:
                lefp_ids= [lefp_id[0] for lefp_id in db.query(LEFP.id).filter( LEFP.legal_entity_id == legal_entity.id, LEFP.portfolio_id == financial_delete_id).all()]
                lefp_name= db.query(Portfolio).filter(Portfolio.id == financial_delete_id).first().name
                mapping_has_data= db.query(Answer.id).filter(Answer.lefp_id.in_(lefp_ids), Answer.active == True).scalar_subquery()
                mapping_has_data= db.query(AnswerData.id).filter(AnswerData.answer_id.in_(mapping_has_data), AnswerData.active == True).first()
                
                delete_entity_financial_mapp.extend(lefp_ids)
                if mapping_has_data:
                    category_names= [category_name[0] for category_name in db.query(Category.name).filter(Category.id.in_(db.query(Answer.category_id).filter(Answer.lefp_id.in_(lefp_ids), Answer.active == True).scalar_subquery())).all()]
                    return ResponseModel(status=False, details=f"Cannot delete: {entity_name} with {lefp_name} has data in Category - {', '.join(category_names)}") 

    if delete_entity_financial_mapp:
        if data.non_financial_portfolio_id == secret.community_id:
            db.query(CFP).filter(CFP.id.in_(delete_entity_financial_mapp)).delete(synchronize_session= False)
        elif data.non_financial_portfolio_id == secret.society_id:
            db.query(SFP).filter(SFP.id.in_(delete_entity_financial_mapp)).delete(synchronize_session= False)
        else:
            db.query(LEFP).filter(LEFP.id.in_(delete_entity_financial_mapp)).delete(synchronize_session= False)

    if entity_financial_mapp:
        db.add_all(entity_financial_mapp)

    new_entry= [FinancialPortfolioMap(non_financial_portfolio_id= data.non_financial_portfolio_id, financial_portfolio_id= i) for i in add_ids]
    if delete_ids:
        db.query(FinancialPortfolioMap).filter(FinancialPortfolioMap.non_financial_portfolio_id == data.non_financial_portfolio_id,FinancialPortfolioMap.financial_portfolio_id.in_(delete_ids)).delete(synchronize_session= False)

    if new_entry:
        db.add_all(new_entry)
        
    db.commit()
    return { "status": True,"details":"Financial Map updated successfully" }

# Delete non financial and financial mapp menu
@router.delete('/financial_map/{id}')
def delete_financial_map(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    data= db.query(FinancialPortfolioMap).filter(FinancialPortfolioMap.id == id)
    if not data.first():
        return ResponseModel(status=False, details="Financial Map not found")
    data.delete(synchronize_session= False)
    db.commit()
    return { "status": True,"details":"Financial Map deleted successfully" }

# Community APIs

# List and filter communities
@router.get('/community', response_model=ResponseModel)
def list_communities(skip: int= 0, limit: int= limit_count, province_id: int= None,search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query= db.query(Community).order_by(Community.name.asc())
    if province_id:
        query= query.filter(Community.province_id == province_id)
    # check permission
    query= authenticate_permission(curr_user, db, query, Community, "community")

    if search:
        query= query.filter(func.lower(Community.code).contains(search.lower()) |
                func.lower(Community.name).contains(search.lower())|
                func.lower(Community.place).contains(search.lower()) |
                func.lower(Community.address).contains(search.lower()) |
                Community.country_id.in_(
                db.query(Country.id).filter(func.lower(Country.name).contains(search.lower())).scalar_subquery()
                ) |
                Community.state_id.in_(
                    db.query(State.id).filter(func.lower(State.name).contains(search.lower())).scalar_subquery()
                ) |
                Community.region_id.in_(
                    db.query(Region.id).filter(func.lower(Region.name).contains(search.lower())).scalar_subquery()
                ) |
                Community.district_id.in_(
                    db.query(District.id).filter(func.lower(District.name).contains(search.lower())).scalar_subquery()
                ) |
               Community.id.in_(
                db.query(CommunityUser.community_id).join(
                    User, CommunityUser.user_id == User.id
                ).filter(
                    func.lower(User.name).contains(search.lower())
                ).scalar_subquery()
                )

            )

    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()

    return { "status": True,"details":"Communities fetched successfully","data": data, "total_count": total_count }

# for mapping table
@router.get('/community/options', response_model=CommunityOptionSchema)
def community_options(skip: int= 0, limit: int= limit_count, search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query= db.query(Community)
    if search:
        # Create subquery to find communities based on incharge user name
        user_subquery = db.query(CommunityUser.community_id).join(
            User, CommunityUser.user_id == User.id
        ).filter(
            func.lower(User.name).contains(search.lower())
        ).subquery()

        # Apply OR filter: community name OR incharge user name
        query = query.filter(
            or_(
                func.lower(Community.name).contains(search.lower()),
                Community.id.in_(select(user_subquery))
            )
        )
    # check permission
    query= authenticate_permission(curr_user, db, query, Community, "community").order_by(Community.name.asc())
    total_count= query.count()
    if limit != 0: 
        query= query.offset(skip).limit(limit)
    data= query.all()
    portfolio= db.query(Portfolio.id).filter(func.lower(Portfolio.name) == 'community').first().id
    for i in data:
        i.portfolio_id= portfolio
    return { "status": True,"details":"Communities fetched successfully", "total_count": total_count,"data": query.all() }

def get_community_dependent(Model, limit, skip, portfolio_id, portfolio_name):
    if limit:
        Model= Model.offset(skip).limit(limit)
    data= Model.all()
    for i in data:
        i.community_user= i.society_user if portfolio_name and portfolio_name.lower()== "society" else i.entity_user
        if portfolio_id:
            i.portfolio_id= portfolio_id
        i.type= portfolio_name if portfolio_name else i.portfolio.name
    return data

# list all community depending portfolio like society to company
@router.get('/community/portfolio', response_model=CommunityOptionSchema)
def community_portfolio(community_id: int, portfolio_id: int= None, skip: int= 0, limit: int= limit_count, search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query= db.query(Community).filter(Community.id == community_id)
    # check permission
    query= authenticate_permission(curr_user, db, query, Community, "community")
    if not query.first():
       return {"status": False, "details":"Community not found"}
    # non financial portfolio data
    society_query= db.query(Society).filter(Society.community_id == community_id, Society.active == True).order_by(Society.name.asc())
    legal_entity_query= db.query(LegalEntity).filter(LegalEntity.community_id == community_id, LegalEntity.active == True).order_by(LegalEntity.name.asc())
    portfolio= db.query(Portfolio.id, Portfolio.name)
    if search:
        society_query= society_query.filter(func.lower(Society.name).contains(search.lower()))
        legal_entity_query= legal_entity_query.filter(func.lower(LegalEntity.name).contains(search.lower()))
    
    society_count = society_query.count() # society count
    # filter by portfolio
    if portfolio_id:
        portfolio= portfolio.filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            return {"status": False, "details":"Portfolio not found"}
        legal_entity_query= legal_entity_query.filter(LegalEntity.portfolio_id == portfolio_id)
        entity_count= legal_entity_query.count()
        Model = society_query if portfolio.name.lower() == 'society' else legal_entity_query # filter by one portfolio
        count= society_count if portfolio.name.lower() == 'society' else entity_count
        return {"status": True, "details":f"{portfolio.name} details fetched successfully", "total_count": count, "data": get_community_dependent(Model, limit, skip, portfolio.id, portfolio.name) }
    # query both society and legal entity

    # counts
    entity_count= legal_entity_query.count()
    data= []
    if limit: # manage pagination of both society and legal entity
        remain= limit - society_count
        society_query = society_query.offset(skip).limit(limit)
        if remain > 0:
            legal_entity_query= legal_entity_query.offset(max(0, skip - society_count)).limit(remain)
    # society= society_query.all()
    society_portfolio= portfolio.filter(func.lower(Portfolio.name) == 'society').first()
    data.extend(get_community_dependent(society_query, limit= None, skip= None, portfolio_id= society_portfolio.id, portfolio_name= society_portfolio.name))
    data.extend(get_community_dependent(legal_entity_query, limit= None, skip= None, portfolio_id= None, portfolio_name= None))

    return { "status": True,"details":"Communities fetched successfully", "total_count":society_count + entity_count, "data": data}

# common function to update users against portfolio
def update_user(db:Session, EntityModule, filterObj, key, entity_id, role_id, users, curr_user, module_name, record_name):
    map_id=[]
    users_temp=[]
    old, new= [], []
    existing_user= db.query(EntityModule).filter(filterObj == entity_id).all()
    for i in existing_user:
        if role_id == i.role_id:
            old.append({"user_id": i.user_id, "role_id": i.role_id, "user_name": i.user.name, "role_name": i.role.name})

    for i in users:
        db_user= db.query(User).filter(User.id == i.user_id, User.active == True).first()
        if not db_user:
            return {"status":False, "details":"User not found"}
        db_role= db.query(Role).filter(Role.id == i.role_id, Role.active == True).first()
        if not db_role:
            return {"status": False, "details":"Role not found"}
        check_user= list(filter(lambda x: x.user_id == i.user_id and x.role_id == i.role_id, existing_user)) if len(existing_user) > 0 else []
        if len(check_user) > 0:
            new.append({"user_id": i.user_id, "role_id": i.role_id, "user_name": db_user.name, "role_name": db_role.name})
            map_id.append(check_user[0].id)
        else :
            if i.user_id:
                new.append({"user_id": i.user_id, "role_id": i.role_id, "user_name": db_user.name, "role_name": db_role.name})
                users_temp.append(EntityModule(**{key: entity_id, "user_id": i.user_id, "role_id": i.role_id, "created_by": curr_user.user_id, "updated_by": curr_user.user_id}))

    # Delete old map
    delete_old_map= db.query(EntityModule).filter(filterObj == entity_id, EntityModule.role_id == role_id, EntityModule.id.notin_(map_id))
    delete_old_map.delete(synchronize_session= False)
    db.commit()

    # add new user community map
    if users_temp:
        db.add_all(users_temp)

    db.commit()

    return {"status": True}

# update portfolio users
@router.put('/users/portfolio')
def update_portfolio_users(non_financial_portfolio_id: int, data: UpdateUsersSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    if not curr_user.province_id:
        return {"status": False, "details":"Unauthorized - user has no province"}
    portfolio= db.query(Portfolio).filter(Portfolio.id == non_financial_portfolio_id).first()
    if not portfolio:
        return {"status": False, "details":"Portfolio not found"}
    if portfolio.name.lower() == 'community':
        # check community
        community= db.query(Community).filter(Community.id == data.entity_id).first()
        cfp= db.query(CFP).filter(CFP.id == data.financial_entity_id).first()
        if not community:
            return {"status": False, "details":"Community not found"}
        if data.financial_entity_id:
            if not cfp:
                return {"status": False, "details":"Community Financial not found"}
            res= update_user(db, CFPUser, CFPUser.cfp_id, 'cfp_id', data.financial_entity_id, data.role_id, data.users, curr_user, 'cfp', f' {community.name} - {cfp.portfolio.name}')
            if res['status'] == False: return res
        else:
            res= update_user(db, CommunityUser, CommunityUser.community_id, 'community_id', data.entity_id, data.role_id, data.users, curr_user, 'Community', community.name)
            if res['status'] == False: return res
    
    elif portfolio.name.lower() == 'society':
        # check society
        society= db.query(Society).filter(Society.id == data.entity_id).first()
        if not society:
            return {"status": False, "details":"Society not found"}
        if data.financial_entity_id:
            sfp= db.query(SFP).filter(SFP.id == data.financial_entity_id).first()
            if not sfp:
                return {"status": False, "details":"Society Financial not found"}
            res= update_user(db, SFPUser, SFPUser.sfp_id, 'sfp_id', data.financial_entity_id, data.role_id, data.users, curr_user, 'sfp', f' {society.name} - {sfp.portfolio.name}')
            if res['status'] == False: return res
        else:
            res= update_user(db, SocietyUser, SocietyUser.society_id, 'society_id', data.entity_id, data.role_id, data.users, curr_user, 'Society', society.name)
            if res['status'] == False: return res
    else:
        # check legal entity
        legal_entity= db.query(LegalEntity).filter(LegalEntity.id == data.entity_id).first()
        if not legal_entity:
            return {"status": False, "details":"Data not found"}
        if data.financial_entity_id:
            lefp= db.query(LEFP).filter(LEFP.id == data.financial_entity_id).first()
            if not lefp:
                return {"status": False, "details":"Financial Data not found"}
            res= update_user(db, LEFPUser, LEFPUser.lefp_id, 'lefp_id', data.financial_entity_id, data.role_id, data.users, curr_user, 'lefp', f'{legal_entity.name} - {lefp.portfolio.name}')
            if res['status'] == False: return res
        else:
            res= update_user(db, LegalEntityUser, LegalEntityUser.legal_entity_id, 'legal_entity_id', data.entity_id, data.role_id, data.users, curr_user, legal_entity.portfolio.name, legal_entity.name)
            if res['status'] == False: return res
    return {"status": True, "details":"User updated successfully"}

#Export community data against province
@router.get("/community/export")
def export_communities(db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    query= db.query(Community)
    # check permission
    query= authenticate_permission(curr_user, db, query, Community, "community")
    communities= query.order_by(Community.name.asc()).all()
    
    cfp_portfolio_names = db.query(Portfolio.name).filter(Portfolio.name.in_(["EPF", "ESI", "GST", "TAN"])).distinct().all()
    cfp_headers = []
    for name_tuple in cfp_portfolio_names:
        name = name_tuple[0]
        cfp_headers.append(f"{name} Number")
        cfp_headers.append(f"{name} Name")
        cfp_headers.append(f"{name} Type")

    default_headers = [
        "S.No", "Code", "Acme Code", "Name", "Place", "Address",
        "Country", "State", "Region", "District"
    ]
    #Prepare Data for Excel Export
    community_data = []
    for index,community_row in enumerate(communities):
        temp= {}
        temp['S.No']= index + 1
        temp['Code']= community_row.code
        temp['Acme Code']= community_row.acme_code
        temp['Name']= community_row.name
        temp['Place']= community_row.place
        temp['Address']= community_row.address
        temp['Country']= community_row.country.name
        temp['State']= community_row.state.name
        temp['Region']= community_row.region.name
        temp['District']= community_row.district.name
        # for com_user_row in community_row.community_user:
        #     temp['Users']= temp.get('user', '') + f"{com_user_row.user.name}, " 
        for cfp_row in community_row.cfp:
            temp[f"{cfp_row.portfolio.name} Number"]= cfp_row.number
            temp[f"{cfp_row.portfolio.name} Name"]= cfp_row.name
            temp[f"{cfp_row.portfolio.name} Type"]= cfp_row.type
            # for cfp_user_row in cfp_row.cfp_user:
            #     temp[f"{cfp_row.portfolio.name} Users"]= temp.get(f"{cfp_row.portfolio.name} Users", '') + f"{cfp_user_row.user.name}, "
        community_data.append(temp)
        # Ensure at least one row with headers if empty
    if not community_data:
        all_headers = default_headers + cfp_headers
        community_data.append({header: "" for header in all_headers})
    # Convert to Pandas DataFrame
    df = pd.DataFrame(community_data)

    # Save to an Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name="Communities")

        # Formatting the Excel Sheet
        workbook = writer.book
        worksheet = writer.sheets["Communities"]
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, workbook.add_format({'bold': True}))  # Make header bold
            worksheet.set_column(col_num, col_num, 20)  # Adjust column width

    output.seek(0)
    
    # Return as FileResponse
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                             
        headers={"Content-Disposition": f"attachment; filename=Community_export_{ datetime.now().strftime('%Y-%m-%d')}.xlsx"}
    )

# get sample excel
@router.get('/community/sample-excel')
def get_sample_excel(db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    columns = ['Acme Code', 'Name', 'Place', 'Address', 'Country', 'State', 'Region', 'District']

    # Community portfolio - When adding a new community, must enter a record for community financial portfolio
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Community").first()

    community_FP = list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, 
                            mapped_financial(db, portfolio_id[0])[0]['financial_name']))
    
    for i in community_FP:
        columns.append(f"{i['name']} Number")
        columns.append(f"{i['name']} Name")
        columns.append(f"{i['name']} Type")
    # Convert to DataFrame
    df = pd.DataFrame(columns=columns)

    # Save to an Excel file in memory
    output = BytesIO()
    
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name="Community Sample")

        # Get workbook and worksheet
        workbook = writer.book
        worksheet = writer.sheets["Community Sample"]

        # Apply header formatting (Bold + Background Color + Center Align)
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#D3D3D3',
            'align': 'center',
            'valign': 'vcenter',
            'border': 1
        })

        # Auto-adjust column widths based on header length
        for col_num, column_name in enumerate(df.columns):
            max_length = max(len(str(column_name)), 15)  # Ensure minimum width of 15
            worksheet.set_column(col_num, col_num, max_length + 2)  # Adjust width dynamically
            worksheet.write(0, col_num, column_name, header_format)  # Write header with formatting

        # Freeze the header row
        worksheet.freeze_panes(1, 0)

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        headers={"Content-Disposition": f"attachment; filename=Community_sample_{datetime.now().strftime('%Y-%m-%d')}.xlsx"}
    )

#Import community 
@router.post("/community/import")
def import_communities(file: UploadFile = File(...),province_id: int = None,db: Session = Depends(get_db),curr_user: Token = Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")

    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")

    # Read Excel or CSV file into DataFrame
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)

    # Check if DataFrame is empty
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")

    # Required Columns
    required_columns = {
        "Acme Code", "Name", "Place", "Address",
        "Country", "State", "Region", "District"
    }

    # Validate if required columns exist
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")

    # Get Province Locations
    locations = get_province_locations(province_id, db)
    community_name_list = db.query(Community).filter(Community.province_id == province_id).all()
    community_name_list = list(map(lambda x: x.name, community_name_list))

    # Get portfolio ID for Community
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Community").first()
    community_FP = list(map(
        lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']},
        mapped_financial(db, portfolio_id[0])[0]['financial_name']
    ))

    new_communities = []
    for index, (_, row) in enumerate(df.iterrows()):


        if not str(row['Name']).strip():
            return ResponseModel(status=False, details=f"Name is empty in row {index + 1}")
        if not str(row['Place']).strip():
            return ResponseModel(status=False, details=f"Place is empty in row {index + 1}")
        if not str(row['Address']).strip():
            return ResponseModel(status=False, details=f"Address is empty in row {index + 1}")

        temp = {
            "acme_code": row.get('Acme Code', ''),
            "name": " ".join(row.get('Name', '').split()),
            "place": row.get('Place', ''),
            "address": row.get('Address', '')
        }

        # Location lookups
        country = list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state = list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region = list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district = list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))

        if not country:
            return ResponseModel(status=False, details=f"Country '{row['Country']}' in row {index + 1} not found")
        if not state:
            return ResponseModel(status=False, details=f"State '{row['State']}' in row {index + 1} not found")
        if not region:
            return ResponseModel(status=False, details=f"Region '{row['Region']}' in row {index + 1} not found")
        if not district:
            return ResponseModel(status=False, details=f"District '{row['District']}' in row {index + 1} not found")

        temp['country_id'] = country[0].id
        temp['state_id'] = state[0].id
        temp['region_id'] = region[0].id
        temp['district_id'] = district[0].id
        temp['cfp'] = []

        for i in community_FP:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validation
            if not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                status=False,
                details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'.Correct {format_hint}"
            )

            temp['cfp'].append({
                'portfolio_id': i['portfolio_id'],
                'number': number,
                'name': name,
                'type': type
            })


        new_communities.append(temp)

    new_ids = []
    for row in new_communities:
        try:
            new_community = Community(
                portfolio_id=secret.community_id,
                province_id=province_id,
                code=get_new_code(db, Community, "COM"),
                acme_code=row['acme_code'],
                name=row['name'],
                place=row['place'],
                address=row['address'],
                country_id=row['country_id'],
                state_id=row['state_id'],
                region_id=row['region_id'],
                district_id=row['district_id'],
                created_by=curr_user.user_id,
                updated_by=curr_user.user_id
            )
            db.add(new_community)
            db.commit()
            db.refresh(new_community)
            new_ids.append(new_community.id)

            db.add_all([
                CFP(
                    community_id=new_community.id,
                    portfolio_id=cfp['portfolio_id'],
                    name=cfp['name'],
                    number=cfp['number'],
                    type= cfp["type"],
                    created_by=curr_user.user_id,
                    updated_by=curr_user.user_id
                )
                for cfp in row['cfp']
            ])
            db.commit()
        except Exception as e:
            db.query(Community).filter(Community.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding community {row['name']}: {str(e)}"}

    return {"status": True, "details": "Community imported successfully"}

# add new community
@router.post('/community')
def add_community(community: CommunitySchema, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    try:
        community.province_id = community.province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
        if not community.province_id:
            return ResponseModel(status=False, details="Province not found")

        community.name = " ".join(community.name.split())

        locations = check_locations(db, community.province_id, community.country_id, community.state_id, community.region_id, community.district_id)
        if locations:
            return ResponseModel(status=False, details=locations)

        community_users = community.community_user
        cfp = community.cfp
        del community.community_user, community.cfp

        community.code = get_new_code(db, Community, "COM")
        community_data = Community(**community.model_dump(), created_by=curr_user.user_id, portfolio_id=secret.community_id, updated_by=curr_user.user_id)
        db.add(community_data)
        # db.commit()
        db.flush()  # Don't commit yet, just get community_data.id

        if community_users:
            db.add_all([
                CommunityUser(
                    community_id=community_data.id,
                    user_id=i.user_id,
                    role_id=i.role_id,
                    created_by=curr_user.user_id,
                    updated_by=curr_user.user_id
                ) for i in community_users if bool(i)
            ])

        portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Community").scalar()
        community_FP = list(map(lambda x: x['portfolio_id'], mapped_financial(db, portfolio_id)[0]['financial_name']))
        validated_cfp_data = []

        # Step 1: Validate financial numbers
        for i in community_FP:
            cfp_i = list(filter(lambda x: x.portfolio_id == i, cfp))
            number = name = cfp_users = None
            
            if cfp_i:
                cfp_i = cfp_i[0]
                number = str(cfp_i.number).strip() if cfp_i.number else ''
                name = cfp_i.name
                type = cfp_i.type
                cfp_users = cfp_i.cfp_user

                portfolio_name = db.query(Portfolio.name).filter(Portfolio.id == i).scalar()
                if number and not validate_identifier(portfolio_name, number):
                    format_hint = FORMAT_HINTS.get(portfolio_name, "")
                    return ResponseModel(
                        status=False,
                        details=f"Invalid {portfolio_name} Number format: '{number}'. Expected format: {format_hint}"
                    )

            validated_cfp_data.append({
                "portfolio_id": i,
                "name": name,
                "number": number,
                "type": type,
                "cfp_users": cfp_users
            })

        # Step 2: Add CFP and CFPUser after validation
        for data in validated_cfp_data:
            cfp_data = CFP(
                community_id=community_data.id,
                portfolio_id=data["portfolio_id"],
                name=data["name"],
                number=data["number"],
                type= data["type"],
                created_by=curr_user.user_id,
                updated_by=curr_user.user_id
            )
            db.add(cfp_data)
            # db.commit()
            db.flush()  # So we can use cfp_data.id without committing

            if data["cfp_users"]:
                db.add_all([
                    CFPUser(
                        user_id=k.user_id,
                        cfp_id=cfp_data.id,
                        role_id=k.role_id,
                        created_by=curr_user.user_id,
                        updated_by=curr_user.user_id
                    ) for k in data["cfp_users"] if bool(k)
                ])

        # ✅ Add notifications for assigned community users
        if community_users:
            for i in community_users:
                if not i:
                    continue
                role_name = db.query(Role.name).filter(Role.id == i.role_id).scalar() or "Member"
                message = f"You are assigned as {role_name} to the community '{community.name}'."
                notification = Notification(
                    user_id=i.user_id,
                    title="You are assigned to a community",
                    message=message,
                    is_read=False
                )
                db.add(notification)

        db.commit()
        return {"status": True, "details": "Community added successfully"}

    except Exception as e:
        db.rollback()
        return ResponseModel(status=False, details=f"Something went wrong: {str(e)}")


# get community by id
@router.get('/community/{id}', response_model=CommunityResponse)
def get_by_id(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate) ):
    community_data= db.query(Community).filter(Community.id == id).first()
    if not community_data:
         return ResponseModel(status= False, details="Community not found")
    return {"status": True, "details": "Community fetched successfully", "data": community_data}

# Edit community
@router.put('/community/{id}')
def edit_community(id: int, community: CommunitySchema, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):

    # Get the existing Community instance
    community_obj = db.query(Community).filter(Community.id == id).first()
    if not community_obj:
        return ResponseModel(status=False, details="Community not found")

    # Super admin can modify province; others cannot
    community.province_id = community.province_id if curr_user.role_id == secret.s_admin_role else None
    province_id = community.province_id or community_obj.province_id
    if not community.province_id:
        del community.province_id  # Remove province_id from update payload for non-superadmin

    # Clean up the name and check if it already exists in the same province
    community.name = " ".join(community.name.split())

    # Validate location hierarchy

    locations = check_locations(db, province_id, community.country_id, community.state_id, community.region_id, community.district_id)
    if locations:
        return ResponseModel(status=False, details=locations)


    community_user = community.community_user
    cfp = community.cfp
    del community.community_user, community.cfp, community.code

    for key, value in community.model_dump().items():
        setattr(community_obj, key, value)
    community_obj.updated_by = curr_user.user_id
    db.commit()

    map_id = []
    users_temp = []
    notification_users = []
    existing_user = db.query(CommunityUser).filter(CommunityUser.community_id == id).all()

    for i in community_user:
        check_user = list(filter(lambda x: x.user_id == i.user_id and x.role_id == i.role_id, existing_user))
        if len(check_user) > 0:
            map_id.append(check_user[0].id)
        else:
            if i.user_id:
                new_user = CommunityUser(
                    community_id=id,
                    user_id=i.user_id,
                    role_id=i.role_id,
                    created_by=curr_user.user_id,
                    updated_by=curr_user.user_id
                )
                users_temp.append(new_user)
                notification_users.append((i.user_id, i.role_id))

    
    to_delete = db.query(CommunityUser).filter(
    CommunityUser.community_id == id,
    CommunityUser.id.notin_(map_id)
    ).all()

    for item in to_delete:
        db.delete(item)

    db.commit()

    if users_temp:
        db.add_all(users_temp)
    db.commit()

    # === CFP mapping ===
    validated_cfp_data = []

    for i in cfp:
        portfolio_name = db.query(Portfolio.name).filter(Portfolio.id == i.portfolio_id).scalar()
        number = str(i.number).strip() if i.number else ""

        if number and not validate_identifier(portfolio_name, number):
            format_hint = FORMAT_HINTS.get(portfolio_name, "")
            return ResponseModel(
                status=False,
                details=f"Invalid {portfolio_name} Number format: '{number}'. Expected format: {format_hint}"
            )

        validated_cfp_data.append((i, portfolio_name, number))

    for i, portfolio_name, number in validated_cfp_data:
        old_cfp_data = db.query(CFP).filter(CFP.portfolio_id == i.portfolio_id, CFP.community_id == id)
        existing = old_cfp_data.first()

        if not existing:
            cfp_data = CFP(
                community_id=id,
                portfolio_id=i.portfolio_id,
                name=i.name,
                number=number,
                type= i.type,
                created_by=curr_user.user_id,
                updated_by=curr_user.user_id
            )
            db.add(cfp_data)
            db.commit()
            db.refresh(cfp_data)

            if i.cfp_user:

                users = [CFPUser(
                    user_id=j.user_id,
                    role_id=j.role_id,
                    cfp_id=cfp_data.id,
                    created_by=curr_user.user_id,
                    updated_by=curr_user.user_id
                ) for j in i.cfp_user if j]
                db.add_all(users)
            db.commit()
        else:
            existing.community_id = id
            existing.portfolio_id = i.portfolio_id
            existing.name = i.name
            existing.number = number
            existing.type = i.type
            existing.updated_by = curr_user.user_id

            db.commit()

            map_id = []
            users = []
            existing_user = db.query(CFPUser).filter(CFPUser.cfp_id == existing.id).all()
            for j in i.cfp_user:
                check_user = list(filter(lambda x: x.user_id == j.user_id and x.role_id == j.role_id, existing_user))
                if check_user:
                    map_id.append(check_user[0].id)
                elif j.user_id:
                    users.append(CFPUser(
                        user_id=j.user_id,
                        role_id=j.role_id,
                        cfp_id=existing.id,
                        created_by=curr_user.user_id,
                        updated_by=curr_user.user_id
                    ))


            to_delete = db.query(CFPUser).filter(
                CFPUser.cfp_id == existing.id,
                CFPUser.id.notin_(map_id)
            ).all()

            for item in to_delete:
                db.delete(item)

            db.commit()

            if users:
                db.add_all(users)
            db.commit()

    # ✅ Send notification to new community users
    community_name = community_obj.name
    for user_id, role_id in notification_users:
        role_name = db.query(Role.name).filter(Role.id == role_id).scalar() or "Member"
        message = f"You are assigned as {role_name} to the community '{community_name}'."
        notification = Notification(
            user_id=user_id,
            title="You are assigned to a community",
            message=message,
            is_read=False
        )
        db.add(notification)
    db.commit()

    return {"status": True, "details": "Community details updated successfully"}


# delete community
@router.delete('/community/{id}')
def delete_community(id: int, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # check permission
    if curr_user.role_id not in [secret.p_admin_role, secret.s_admin_role]:
        return ResponseModel(status=False, details="You don't have permission to delete community")
    
    # Get the community object (loads it into session)
    community = db.query(Community).filter(Community.id == id).first()
    if not community:
        return ResponseModel(status=False, details="Community not found")
    
    has_society = db.query(Society).filter(Society.community_id == id).first()
    has_legal_entity = db.query(LegalEntity).filter(LegalEntity.community_id == id).first()
    has_cfp = db.query(CFP).filter(CFP.community_id == id).all()
    has_cfp_documents = db.query(Answer).filter(Answer.cfp_id.in_([i.id for i in has_cfp])).all() if has_cfp else []
    has_documents = db.query(Answer).filter(Answer.community_id == id).all()
    # Add more checks as needed
    if has_society:
        return ResponseModel(
            status=False,
            details=f"Cannot delete: Community is mapped to a society {has_society.name}."
        )
    elif has_legal_entity:
        return ResponseModel(
            status=False,
            details=f"Cannot delete: Community is mapped to a Legal Entity {has_legal_entity.name}."
        )
    elif has_documents:
        return ResponseModel(
            status=False,
            details=f"Cannot delete: Community has answered documents."
        )
    elif has_cfp_documents:
        return ResponseModel(
            status=False,
            details=f"Cannot delete: Community has answered documents in CFPs."
        )

    # Delete using ORM
    db.delete(community)
    db.commit()
    
    return {"status": True, "details": "Community deleted successfully"}

# Society APIs

# List and filter society
@router.get('/society', response_model=ResponseModel)
def list_societies(skip: int= 0, limit: int= limit_count, province_id: int= None,search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query= db.query(Society).order_by(Society.name.asc())
    if province_id:
        query= query.filter(Society.province_id == province_id)
    # check permission
    query= authenticate_permission(curr_user, db, query, Society, "society")

    if search:
        query= query.filter(func.lower(Society.code).contains(search.lower()) |
                func.lower(Society.name).contains(search.lower())|
                func.lower(Society.place).contains(search.lower()) |
                func.lower(Society.address).contains(search.lower()) |
                Society.country_id.in_(
                db.query(Country.id).filter(func.lower(Country.name).contains(search.lower())).scalar_subquery()
                ) |
                Society.state_id.in_(
                    db.query(State.id).filter(func.lower(State.name).contains(search.lower())).scalar_subquery()
                ) |
                Society.region_id.in_(
                    db.query(Region.id).filter(func.lower(Region.name).contains(search.lower())).scalar_subquery()
                ) |
                Society.district_id.in_(
                    db.query(District.id).filter(func.lower(District.name).contains(search.lower())).scalar_subquery()
                ) |
                Society.id.in_(
                    db.query(SocietyUser.society_id).join(User,SocietyUser.user_id == User.id).filter(func.lower(User.name).contains(search.lower())).scalar_subquery()    
                    
                )
            )

    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()

    return { "status": True,"details":"Societies fetched successfully","data": data, "total_count": total_count }

#society againt export the province
@router.get("/society/export")
def export_society(db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    query = db.query(Society)
    
    # Check permission
    query = authenticate_permission(curr_user, db, query, Society, "society")
    societies = query.order_by(Society.name.asc()).all()
    
    cfp_portfolio_names = db.query(Portfolio.name).filter(Portfolio.name.in_(["EPF", "ESI", "GST", "TAN","PAN"])).distinct().all()
    cfp_headers = []
    for name_tuple in cfp_portfolio_names:
        name = name_tuple[0]
        cfp_headers.append(f"{name} Number")
        cfp_headers.append(f"{name} Name")
        cfp_headers.append(f"{name} Type")

    default_headers=["S.No","Code","Community","Society", "Name","Place","Address","Country","State","Region","District"]

    # Prepare Data for Excel Export
    society_data = []
    for index, society_row in enumerate(societies):
        temp = {
            'S.No': index + 1,
            'Code': society_row.code,
            'Community': society_row.community.name,
            'Society Name': society_row.name,
            'Place': society_row.place,
            'Address': society_row.address,
            'Country': society_row.country.name,
            'State': society_row.state.name,
            'Region': society_row.region.name,
            'District': society_row.district.name
        }
        
        # Adding Society Financial Portfolio (SFP) data
        for sfp_row in society_row.sfp:
            temp[f"{sfp_row.portfolio.name} Number"] = sfp_row.number
            temp[f"{sfp_row.portfolio.name} Name"] = sfp_row.name
            temp[f"{sfp_row.portfolio.name} Type"] = sfp_row.type
        
        society_data.append(temp)
    if not society_data:
        all_headers = default_headers + cfp_headers
        society_data.append({header: "" for header in all_headers})

    # Convert to Pandas DataFrame
    df = pd.DataFrame(society_data)

    # Save to an Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name="Societies")

        # Formatting the Excel Sheet
        workbook = writer.book
        worksheet = writer.sheets["Societies"]
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, workbook.add_format({'bold': True}))  # Make header bold
            worksheet.set_column(col_num, col_num, 20)  # Adjust column width

    output.seek(0)

    # Return as a downloadable file
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=society_export_{datetime.now().strftime('%Y-%m-%d')}.xlsx"}
    )
    


# Import Society 
@router.post("/society/import")
def import_societies(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # verify province
    province_id= province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")
    allowed= ['.xlsx', '.xls', '.csv',]
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")

    # Read Excel file
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
        
    # Check if DataFrame is empty
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")  
    
    # Required Columns
    required_columns = {
        "Community", "Society Name", "Place", "Address",
        "Country", "State", "Region", "District"
    }
        # Validate if required columns exist
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")
    
    # Get Province Locations
    locations= get_province_locations(province_id, db)
    society_name_list= db.query(Society).filter(Society.province_id == province_id).all()
    society_name_list= list(map(lambda x: x.name, society_name_list))

    # Society portfolio - When addding new Society must enter record for Society financial portfolio
    portfolio_id= db.query(Portfolio.id).filter(Portfolio.name == "Society").first()
    society_Fp= list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, mapped_financial(db, portfolio_id[0])[0]['financial_name']))

    new_societies = []
    # Process each row and insert into the database
    for index, (_, row) in enumerate(df.iterrows()):
        if 'Community' not in row or not str(row['Community']).strip():
            return ResponseModel(status=False, details=f"Community is empty in row {index + 1}")
    
        if 'Society Name' not in row or not str(row['Society Name']).strip():
            return ResponseModel(status=False, details=f"Society is empty in row {index + 1}")
        
        if 'Place' not in row or not str(row['Place']).strip():
            return ResponseModel(status=False, details=f"Place is empty in row {index + 1}")
        
        if 'Address' not in row or not str(row['Address']).strip():
            return ResponseModel(status=False, details=f"Address is empty in row {index + 1}")
        
        
        community_record = db.query(Community).filter(Community.name.ilike(row['Community'])).first()

        if not community_record:
            return ResponseModel(status=False, details=f"Community '{row['Community']} - in row {index + 1}' not found in database")
    
 

        temp= {"Community":community_record.name,"Society Name": " ".join(row.get('Society Name', '').split()), "place": row.get('Place', ''), "address": row.get('Address', '')}
        # if row.get('Society Name', '') in list(map(lambda x: x['Society Name'], new_societies)) or row.get('Society Name', '') in society_name_list:
        #     return ResponseModel(status=False, details=f"Society name '{row.get('Socirty Name', '')}' already exists")


        #Input From User is Text
        country_id= list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state_id= list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region_id= list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district_id= list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))

        # Validate that all IDs were found
        if not country_id:
            return ResponseModel(status=False, details=f"Country '{row['Country']} - in row {index + 1}' not found in database")
        if not state_id:
            return ResponseModel(status=False, details=f"State '{row['State']} - in row {index + 1}' not found in database")
        if not region_id:
            return ResponseModel(status=False, details=f"Region '{row['Region']} - in row {index + 1}' not found in database")
        if not district_id:
            return ResponseModel(status=False, details=f"District '{row['District']} - in row {index + 1}' not found in database")
        
        temp['country_id']= country_id[0].id
        temp['state_id']= state_id[0].id
        temp['region_id']= region_id[0].id
        temp['district_id']= district_id[0].id
        temp['sfp']= []

        for i in society_Fp:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validation
            if not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'. Correct format: {format_hint}"
            )

            temp['sfp'].append({
                'portfolio_id': i["portfolio_id"],
                'number': number,
                'name': name
                ,'type': type
            })
            
            
        new_societies.append(temp)

    new_ids=[]
    # insert into database
    for row in new_societies:
        try:
            new_society = Society(portfolio_id= secret.society_id,province_id= province_id, code= get_new_code(db, Society, "SOC"), community_id= community_record.id, 
                name= row.get('Society Name', ''), place= row['place'], address= row['address'], country_id= row['country_id'], 
                state_id= row['state_id'], region_id= row['region_id'], district_id= row['district_id'],
                created_by= curr_user.user_id, updated_by= curr_user.user_id
            )
            db.add(new_society)
            db.commit()
            db.refresh(new_society)
            new_ids.append(new_society.id)
            # insert sfp
            db.add_all([SFP(society_id= new_society.id, portfolio_id= i['portfolio_id'], name= i['name'], number= i['number'],type= i["type"], created_by= curr_user.user_id, updated_by= curr_user.user_id) for i in row['sfp']])
            db.commit()
        except Exception as e:
            # delete created communities
            db.query(Society).filter(Society.id.in_(new_ids)).delete(synchronize_session= False)
            db.commit()
            return {"status": False, "details": f"Error in adding Society {row['Society Name']}: {str(e)}"}
    return {"status": True, "details": "Society imported successfully"}


#society example getsample
@router.get("/society/sample-excel")
def get_sample_excel_society(db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    columns = ['Community', 'Society Name', 'Place', 'Address', 'Country', 'State', 'Region', 'District']

    # Fetch portfolio ID for "Society"
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Society").first()
    
    if portfolio_id:
        society_FP = list(map(
            lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, 
            mapped_financial(db, portfolio_id[0])[0]['financial_name']
        ))

        # Add portfolio-specific columns dynamically
        for i in society_FP:
            columns.append(f"{i['name']} Number")
            columns.append(f"{i['name']} Name")
            columns.append(f"{i['name']} Type")
    # Convert to DataFrame
    df = pd.DataFrame(columns=columns)

    # Save to an Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name="Society Sample")

        # Formatting the Excel Sheet
        workbook = writer.book
        worksheet = writer.sheets["Society Sample"]

        # Apply bold format for headers
        header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'align': 'center'})

        # Write headers with formatting
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)  # Make header bold
            worksheet.set_column(col_num, col_num, 20)  # Adjust column width

    output.seek(0)

    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=Society_sample_{datetime.now().strftime('%Y-%m-%d')}.xlsx"}
    )


# get society by id
@router.get('/society/{id}', response_model=SocietyResponse)
def get_by_id(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate) ):
    society_data= db.query(Society).filter(Society.id == id).first()
    
    if not society_data:
         return ResponseModel(status= False, details="Society not found")
    return {"status": True, "details": "Society fetched successfully", "data": society_data}

# Get new society id
# @router.get('/society_id')
# def get_new_society_id(db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
#     return {"status": True, "details": "New community id", "data": get_new_code(db, Society, "SOC")}

# add new Society
@router.post('/society')
def add_society(society: SocietySchema, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    province_id = db.query(Community.province_id).filter(Community.id == society.community_id).scalar()
    province_id = province_id or curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")

    if not db.query(Community).filter(Community.id == society.community_id).first():
        return ResponseModel(status=False, details="Community not found")

    society.name = " ".join(society.name.split())

    locations = check_locations(db, province_id, society.country_id, society.state_id, society.region_id, society.district_id)
    if locations:
        return ResponseModel(status=False, details=locations)

    society.province_id = province_id
    society_users = society.society_user
    sfp = society.sfp
    del society.society_user, society.sfp

    society.code = get_new_code(db, Society, "SOC")

    try:
        # Validate financial numbers first
        portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Society").scalar()
        society_FP = list(map(lambda x: x['portfolio_id'], mapped_financial(db, portfolio_id)[0]['financial_name']))

        validated_sfp_data = []
        for i in society_FP:
            sfp_i = list(filter(lambda x: x.portfolio_id == i, sfp))

            number = name = sfp_users = None
            if sfp_i:
                sfp_i = sfp_i[0]
                number = str(sfp_i.number).strip() if sfp_i.number else ''
                name = sfp_i.name
                sfp_users = sfp_i.sfp_user
                type = sfp_i.type
                portfolio_name = db.query(Portfolio.name).filter(Portfolio.id == i).scalar()
                if number and not validate_identifier(portfolio_name, number):
                    format_hint = FORMAT_HINTS.get(portfolio_name, "")
                    return ResponseModel(
                        status=False,
                        details=f"Invalid {portfolio_name} Number format: '{number}'. Expected format: {format_hint}"
                    )

            validated_sfp_data.append({
                "portfolio_id": i,
                "name": name,
                "number": number,
                "type": type,
                "sfp_users": sfp_users
            })

        # Create society
        society_data = Society(
            **society.model_dump(),
            created_by=curr_user.user_id,
            updated_by=curr_user.user_id,
            portfolio_id=secret.society_id
        )
        db.add(society_data)
        db.commit()
        db.refresh(society_data)

        # Add society users
        if society_users:
            db.add_all([
                SocietyUser(
                    society_id=society_data.id,
                    user_id=i.user_id,
                    role_id=i.role_id,
                    created_by=curr_user.user_id,
                    updated_by=curr_user.user_id
                ) for i in society_users if bool(i)
            ])
        db.commit()

        # Add SFPs and their users
        for data in validated_sfp_data:
            sfp_data = SFP(
                society_id=society_data.id,
                portfolio_id=data["portfolio_id"],
                name=data["name"],
                number=data["number"],
                type= data["type"],
                created_by=curr_user.user_id,
                updated_by=curr_user.user_id
            )
            db.add(sfp_data)
            db.commit()
            db.refresh(sfp_data)

            if data["sfp_users"]:
                viewer = [
                    SFPUser(
                        user_id=k.user_id,
                        sfp_id=sfp_data.id,
                        role_id=k.role_id,
                        created_by=curr_user.user_id,
                        updated_by=curr_user.user_id
                    ) for k in data["sfp_users"] if bool(k)
                ]
                db.add_all(viewer)
                db.commit()

        # ✅ Add notifications for assigned society users
        if society_users:
            for i in society_users:
                if not i:
                    continue
                role_name = db.query(Role.name).filter(Role.id == i.role_id).scalar() or "Member"
                message = f"You are assigned as {role_name} to the society '{society.name}'."
                notification = Notification(
                    user_id=i.user_id,
                    title="You are assigned to a society",
                    message=message,
                    is_read=False
                )
                db.add(notification)
            db.commit()

        return {"status": True, "details": "Society added successfully"}

    except Exception as e:
        db.rollback()
        return ResponseModel(status=False, details=f"Failed to add society: {str(e)}")


# Edit society
@router.put('/society/{id}', response_model=ResponseModel)
def edit_society(id: int, society: SocietySchema, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
        return ResponseModel(status=False, details="You don't have permission to edit society")

    old_data = db.query(Society).filter(Society.id == id)
    if not old_data.first():
        return ResponseModel(status=False, details="Society not found")

    # check community exists
    if not db.query(Community).filter(Community.id == society.community_id).first():
        return ResponseModel(status=False, details="Community not found")

    # Normalize name
    society.name = " ".join(society.name.split())

    # Apply province only for super admin
    society.province_id = society.province_id if curr_user.role_id == secret.s_admin_role else None
    province_id = society.province_id if society.province_id else old_data.first().province_id
    if not society.province_id:
        del society.province_id

    # Validate locations
    locations = check_locations(db, province_id, society.country_id, society.state_id, society.region_id, society.district_id)
    if locations:
        return ResponseModel(status=False, details=locations)

    # Extract and detach nested data
    society_user = society.society_user
    sfp = society.sfp
    del society.society_user, society.sfp, society.code


    society_obj = old_data.first()
    for key, value in society.model_dump().items():
        setattr(society_obj, key, value)
    society_obj.updated_by = curr_user.user_id

    db.commit()
    map_id= []
    users_temp= []
    existing_user= db.query(SocietyUser).filter(SocietyUser.society_id == id).all()
    for i in society_user:
        check_user= list(filter(lambda x: x.user_id == i.user_id and x.role_id == i.role_id, existing_user))
        if len(check_user) > 0:
            map_id.append(check_user[0].id)
        else :
            if i.user_id:
                users_temp.append(SocietyUser(society_id= id, user_id= i.user_id, role_id= i.role_id, created_by= curr_user.user_id, updated_by= curr_user.user_id))
    
    # Delete old map
    delete_old_map= db.query(SocietyUser).filter(SocietyUser.society_id == id, SocietyUser.id.notin_(map_id))
    for item in delete_old_map:
        db.delete(item)
    db.commit()

    # Add new society users
    if users_temp:
        db.add_all(users_temp)
    db.commit()

    # Validate and update SFP
    validated_sfp_data = []
    for i in sfp:
        portfolio_name = db.query(Portfolio.name).filter(Portfolio.id == i.portfolio_id).scalar()
        number = str(i.number).strip() if i.number else ""

        if number and not validate_identifier(portfolio_name, number):
            format_hint = FORMAT_HINTS.get(portfolio_name, "")
            return ResponseModel(
                status=False,
                details=f"Invalid {portfolio_name} Number format: '{number}'. Expected format: {format_hint}"
            )
        validated_sfp_data.append((i, portfolio_name, number))

    for i, portfolio_name, number in validated_sfp_data:
        old_sfp_data = db.query(SFP).filter(SFP.society_id == id, SFP.portfolio_id == i.portfolio_id)
        if not old_sfp_data.first():
            sfp_data = SFP(
                society_id=id,
                portfolio_id=i.portfolio_id,
                name=i.name,
                number=number,
                type= i.type,
                created_by=curr_user.user_id,
                updated_by=curr_user.user_id
            )
            db.add(sfp_data)
            db.commit()
            db.refresh(sfp_data)

            if i.sfp_user:
                users = [SFPUser(
                    user_id=j.user_id,
                    role_id=j.role_id,
                    sfp_id=sfp_data.id,
                    created_by=curr_user.user_id,
                    updated_by=curr_user.user_id
                ) for j in i.sfp_user if bool(j)]
                db.add_all(users)
            db.commit()
        else:
            sfp_obj = old_sfp_data.first()
            sfp_obj.name = i.name
            sfp_obj.number = number
            sfp_obj.type = i.type
            sfp_obj.updated_by = curr_user.user_id

            db.commit()

            map_id = []
            users = []
            existing_user = db.query(SFPUser).filter(SFPUser.sfp_id == old_sfp_data.first().id).all()
            for j in i.sfp_user:
                check_user = list(filter(lambda x: x.user_id == j.user_id and x.role_id == j.role_id, existing_user))
                if check_user:
                    map_id.append(check_user[0].id)
                else :
                    
                    if j.user_id:
                        users.append(SFPUser(user_id= j.user_id, role_id= j.role_id, sfp_id= old_sfp_data.first().id, created_by= curr_user.user_id, updated_by= curr_user.user_id))
    
            # Delete old map
            delete_old_map= db.query(SFPUser).filter(SFPUser.sfp_id == old_sfp_data.first().id, SFPUser.id.notin_(map_id))
            for item in delete_old_map:
                db.delete(item)

            db.commit()

            if users:
                db.add_all(users)
            db.commit()

    # ✅ Send notification to new society users
    society_name = old_data.first().name
    for user in users_temp:
        role_name = db.query(Role.name).filter(Role.id == user.role_id).scalar() or "Member"
        message = f"You are assigned as {role_name} to the society '{society_name}'."
        notification = Notification(
            user_id=user.user_id,
            title="You are assigned to a society",
            message=message,
            is_read=False
        )
        db.add(notification)
    db.commit()

    return {"status": True, "details": "Society details updated successfully"}


# delete Society
@router.delete('/society/{id}')
def delete_society(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
        return ResponseModel(status=False, details="You don't have permission to delete society")
    society_data= db.query(Society).filter(Society.id == id)
    if not society_data.first():
        return ResponseModel(status=False, details="Society not found")

    has_legal_entity = db.query(LegalEntity).filter(LegalEntity.society_id == id).first()
    has_sfp = db.query(SFP).filter(SFP.society_id == id).all()
    has_sfp_documents = db.query(Answer).filter(Answer.sfp_id.in_([i.id for i in has_sfp])).all() if has_sfp else []
    has_documents = db.query(Answer).filter(Answer.society_id == id).all()
    # Add more checks as needed
    if has_legal_entity:
        return ResponseModel(
            status=False,
            details=f"Cannot delete: Society is mapped to a Legal Entity {has_legal_entity.name}."
        )
    
    elif has_documents:
        return ResponseModel(
            status=False,
            details=f"Cannot delete: Society has answered documents."
        )
    
    elif has_sfp_documents:
        return ResponseModel(
            status=False,
            details=f"Cannot delete: Society has answered documents."
        )

    db.delete(society_data.first())
    db.commit()
    # community user, sfp, sfpUser will be removed by cascade method

    return { "status": True,"details":"Society deleted successfully" }
#Diocese API

#Diocese Sample Export
@router.get("/diocese/sample-excel")
def get_sample_excel_diocese(db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    
    columns = [ 'Name', 'Place', 'Address', 'Country', 'State', 'Region', 'District']

    # Convert to DataFrame
    df = pd.DataFrame(columns=columns)

    # Save to an Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name="Diocese Sample")

        # Formatting the Excel Sheet
        workbook = writer.book
        worksheet = writer.sheets["Diocese Sample"]

        # Apply bold format for headers
        header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'align': 'center'})

        # Write headers with formatting
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)  # Make header bold
            worksheet.set_column(col_num, col_num, 20)  # Adjust column width

    output.seek(0)

    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=Diocese_sample_{datetime.now().strftime('%Y-%m-%d')}.xlsx"}
    )
#Diocese Export
@router.get("/diocese/export")
def export_diocese(db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    query = db.query(Diocese)

    # Check permission
    query = authenticate_permission(curr_user, db, query, Diocese, "diocese")
    dioceses = query.order_by(Diocese.name.asc()).all()

    # Define columns
    columns = ["S.No", "Code", "Name", "Place", "Address", "Country", "State", "Region", "District"]
    diocese_data = []

    # Populate data if available
    for index, d in enumerate(dioceses):
        diocese_data.append({
            "S.No": index + 1,
            "Code": d.code,
            "Name": d.name,
            "Place": d.place,
            "Address": d.address,
            "Country": d.country.name if d.country else "",
            "State": d.state.name if d.state else "",
            "Region": d.region.name if d.region else "",
            "District": d.district.name if d.district else ""
        })

    # If no data, just create a single empty row with headers
    if not diocese_data:
        diocese_data.append({col: "" for col in columns})

    # Convert to DataFrame
    df = pd.DataFrame(diocese_data)

    # Write to Excel
    output = BytesIO()
    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Diocese")

        # Format headers
        workbook = writer.book
        worksheet = writer.sheets["Diocese"]
        header_format = workbook.add_format({'bold': True})

        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
            worksheet.set_column(col_num, col_num, 20)

    output.seek(0)

    # Return Excel file
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=diocese_export_{datetime.now().strftime('%Y-%m-%d')}.xlsx"
        }
    )
    
#Diocese Import
@router.post("/diocese/import")
def import_diocese(file: UploadFile = File(...),province_id: int = None,db: Session = Depends(get_db),curr_user: Token = Depends(authenticate),):
    # Verify Province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")

    # Validate File Extension
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")

    # Read File into DataFrame
    contents = file.file.read()
    try:
        if file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
        else:
            df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
    except Exception as e:
        return ResponseModel(status=False, details=f"Failed to read file: {str(e)}")
    
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")  

    # Required Columns
    required_columns = {"Name", "Place", "Address", "Country", "State", "Region", "District"}
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")

    # Get Province Locations
    locations = get_province_locations(province_id, db)

    new_diocese = []

    # Parse and Validate Each Row
    for index, (_, row) in enumerate(df.iterrows()):
        if 'Name' not in row or not str(row['Name']).strip():
            return ResponseModel(status=False,details=f"Name is empty in row{index + 1}")
        if 'Place' not in row or not str(row['Place']).strip():
            return ResponseModel(status=False,details=f"Place is empty in row{index + 1}")
        if 'Address' not in row or not str(row['Address']).strip():
            return ResponseModel(status=False,details=f"Address is empty in row{index + 1}")
        name = " ".join(row.get("Name", "").split())
        place = row.get("Place", "")
        address = row.get("Address", "")

        # Look up Location IDs
        country = next((x for x in locations['countries'] if x.name.lower() == row['Country'].lower()), None)
        state = next((x for x in locations['states'] if x.name.lower() == row['State'].lower()), None)
        region = next((x for x in locations['regions'] if x.name.lower() == row['Region'].lower()), None)
        district = next((x for x in locations['districts'] if x.name.lower() == row['District'].lower()), None)

        if not country:
            return ResponseModel(status=False, details=f"Country '{row['Country']}' in row {index+1} not found")
        if not state:
            return ResponseModel(status=False, details=f"State '{row['State']}' in row {index+1} not found")
        if not region:
            return ResponseModel(status=False, details=f"Region '{row['Region']}' in row {index+1} not found")
        if not district:
            return ResponseModel(status=False, details=f"District '{row['District']}' in row {index+1} not found")

        new_diocese.append({
            "name": name,
            "place": place,
            "address": address,
            "country_id": country.id,
            "state_id": state.id,
            "region_id": region.id,
            "district_id": district.id,
        })

    # Insert into DB
    inserted_ids = []
    for row in new_diocese:
        try:
            new_entry = Diocese(
                province_id=province_id,
                code=get_new_code(db, Diocese, "DIO"),
                name=row["name"],
                place=row["place"],
                address=row["address"],
                country_id=row["country_id"],
                state_id=row["state_id"],
                region_id=row["region_id"],
                district_id=row["district_id"],
                created_by=curr_user.user_id,
                updated_by=curr_user.user_id,
            )
            db.add(new_entry)
            db.commit()
            db.refresh(new_entry)
            inserted_ids.append(new_entry.id)
        except Exception as e:
            db.query(Diocese).filter(Diocese.id.in_(inserted_ids)).delete(synchronize_session=False)
            db.commit()
            return ResponseModel(status=False, details=f"Error adding Diocese {row['name']}: {str(e)}")

    return ResponseModel(status=True, details="Diocese imported successfully")



#Diocese post Method
@router.post("/diocese", response_model=ResponseModel)
def add_diocese(diocese: DioceseSchema, db: Session = Depends(get_db),curr_user:Token=Depends(authenticate)):
    # if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
    #     return ResponseModel(status=False, details="You don't have permission to add diocese")
    diocese.province_id= diocese.province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not diocese.province_id:
        return ResponseModel(status=False, details="Province not found")
    # check locations
    locations= check_locations(db, diocese.province_id, diocese.country_id, diocese.state_id, diocese.region_id, diocese.district_id)
    if locations:
        return ResponseModel(status=False, details=locations)
    
    diocese.name= " ".join(diocese.name.split())
    diocese.code = get_new_code(db, Diocese, "DIO")
    new_diocese = Diocese(**diocese.model_dump(), created_by=curr_user.user_id, updated_by=curr_user.user_id)
    db.add(new_diocese)
    db.commit()
    db.refresh(new_diocese)
    return {"status": True, "details": "Diocese added successfully", "data": new_diocese}

# diaocese list options
@router.get('/diocese-options', response_model=DioceseOptionsSchema)
def get_diocese_options(db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    data= db.query(Diocese)
    if curr_user.role_id != secret.s_admin_role: 
        data= data.filter(Diocese.province_id == curr_user.province_id)
    total_count= data.count()
    data= data.order_by(Diocese.name.asc()).all()
    return {"status": True, "details": "Users fetched successfully", "total_count": total_count, "data": data}

#Diocese get Method
@router.get("/diocese", response_model=ResponseModel)
def list_dioceses(skip: int = 0, limit: int = limit_count, province_id: int = None, search: str = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    query = db.query(Diocese).order_by(Diocese.name.asc())
    if province_id:
        query = query.filter(Diocese.province_id == province_id)
    if curr_user.role_id != secret.s_admin_role:
        query = query.filter(Diocese.province_id == curr_user.province_id)
    if search:
        query = query.filter(
            func.lower(Diocese.code).contains(search.lower()) |
            func.lower(Diocese.name).contains(search.lower()) |
            func.lower(Diocese.place).contains(search.lower()) |
            func.lower(Diocese.address).contains(search.lower())|
            Diocese.country_id.in_(
                db.query(Country.id).filter(func.lower(Country.name).contains(search.lower())).scalar_subquery()
                ) |
            Diocese.state_id.in_(
                    db.query(State.id).filter(func.lower(State.name).contains(search.lower())).scalar_subquery()
                ) |
            Diocese.region_id.in_(
                    db.query(Region.id).filter(func.lower(Region.name).contains(search.lower())).scalar_subquery()
                ) |
            Diocese.district_id.in_(
                    db.query(District.id).filter(func.lower(District.name).contains(search.lower())).scalar_subquery()
                )
            )

    total_count = query.count()
    if limit != 0:
        query = query.offset(skip).limit(limit)

    dioceses = query.all()

    return { "status": True,"details":"Diocese fetched successfully" ,"total_count": total_count,"data": dioceses }

#get method using id
@router.get("/diocese/{id}", response_model=ResponseModel)
def get_diocese(id: int, db: Session = Depends(get_db), curr_user=Depends(authenticate)):
    diocese = db.query(Diocese).filter(Diocese.id == id).first()

    if not diocese:
        return ResponseModel(status=False, details="Diocese not found")

    return {"status": True, "details": "Diocese fetched successfully", "data": diocese}


#Diocese put Method
@router.put("/diocese/{id}")
def edit_diocese(id: int, diocese: DioceseSchema, db: Session = Depends(get_db),curr_user:Token=Depends(authenticate)):
    # if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
    #     return ResponseModel(status=False, details="You don't have permission to edit diocese")
    diocese_data = db.query(Diocese).filter(Diocese.id == id)
    if not diocese_data:
        return ResponseModel(status=False, details="Diocese not found")
    diocese.province_id= diocese.province_id if curr_user.role_id == secret.s_admin_role else None
    province_id= diocese.province_id if diocese.province_id else diocese_data.first().province_id
    if not diocese.province_id:
        del diocese.province_id
    # check locations
    locations= check_locations(db, province_id , diocese.country_id, diocese.state_id, diocese.region_id, diocese.district_id)
    if locations:
        return ResponseModel(status=False, details=locations)
    diocese.name= " ".join(diocese.name.split())
    diocese_data.update({**diocese.model_dump(), "updated_by": curr_user.user_id}, synchronize_session=False)
    db.commit()
    return {"status": True, "details": "Diocese updated successfully"}

#Dioces delete Method
@router.delete("/diocese/{id}")
def delete_diocese(id: int, db: Session = Depends(get_db),curr_user:Token=Depends(authenticate)):
    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
        return ResponseModel(status=False, details="You don't have permission to delete diocese")
    diocese_data = db.query(Diocese).filter(Diocese.id == id)
    if not diocese_data.first():
        return ResponseModel(status=False, details="Diocese not found")
    
    diocese_data.delete()
    db.commit()
    return {"status": True, "details": "Diocese deleted successfully"}


# Legal Entity API
def get_portfolio_name(portfolio_id, db:Session):
    try:
        return db.query(Portfolio).filter(Portfolio.id == portfolio_id).first().name
    except:
        return None

# List and filter entity
@router.get('/entity', response_model=ResponseModel)
def list_entities( portfolio_id: int, skip: int= 0, limit: int= limit_count, province_id: int= None, search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query= db.query(LegalEntity).order_by(LegalEntity.name.asc())
    if province_id:
        query= query.filter(LegalEntity.province_id == province_id)
    if portfolio_id:
        query= query.filter(LegalEntity.portfolio_id == portfolio_id)
    # check permission
    query= authenticate_permission(curr_user, db, query, LegalEntity, "legal_entity")
    if search:
        query= query.filter(func.lower(LegalEntity.code).contains(search.lower()) |
                func.lower(LegalEntity.name).contains(search.lower())|
                func.lower(LegalEntity.place).contains(search.lower()) |
                func.lower(LegalEntity.address).contains(search.lower()) |
                LegalEntity.country_id.in_(
                db.query(Country.id).filter(func.lower(Country.name).contains(search.lower())).scalar_subquery()
                ) |
                LegalEntity.state_id.in_(
                    db.query(State.id).filter(func.lower(State.name).contains(search.lower())).scalar_subquery()
                ) |
                LegalEntity.region_id.in_(
                    db.query(Region.id).filter(func.lower(Region.name).contains(search.lower())).scalar_subquery()
                ) |
                LegalEntity.district_id.in_(
                    db.query(District.id).filter(func.lower(District.name).contains(search.lower())).scalar_subquery()
                ) | 
                LegalEntity.id.in_(
                db.query(LegalEntityUser.legal_entity_id).join(
                    User, LegalEntityUser.user_id == User.id
                ).filter(
                    func.lower(User.name).contains(search.lower())
                ).scalar_subquery()
                )
            )

    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()

    return { "status": True,"details":f"{get_portfolio_name(portfolio_id, db)} fetched successfully","data": data, "total_count": total_count }

# get entity by id
@router.get('/entity/{id}', response_model=LegalEntityResponse)
def get_by_id(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate) ):
    entity_data= db.query(LegalEntity).filter(LegalEntity.id == id).first()
    
    if not entity_data:
        return ResponseModel(status= False, details=f"Data not found")
    portfolio_name= get_portfolio_name(entity_data.portfolio_id, db)

    return {"status": True, "details": f" {portfolio_name} fetched successfully", "data": entity_data}

# Get new Legal entity id
def get_new_entity_id(portfolio_id:int, db:Session, portfolio_name):
    latest_record= db.query(LegalEntity.code).filter(LegalEntity.portfolio_id == portfolio_id).order_by(LegalEntity.id.desc()).first()
    prefix= portfolio_name[:3].upper()
    if portfolio_name.lower() == "Social Sectors".lower():
        prefix= "SOS"
    if latest_record:
        code= str(int(latest_record[0][4:]) +1).zfill(4)
    else:
        code= "0001"
    return prefix+code

# add new Legal entity
@router.post('/entity')
def add_entity(entity: LegalEntitySchema, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    portfolio_name = get_portfolio_name(entity.portfolio_id, db)

    province_id = db.query(Community.province_id).filter(Community.id == entity.community_id).scalar()
    province_id = province_id if province_id else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")

    # Check community, society, diocese existence
    if not db.query(Community.id).filter(Community.id == entity.community_id).first():
        return ResponseModel(status=False, details="Community not found")
    if entity.society_id and not db.query(Society.id).filter(Society.id == entity.society_id).first():
        return ResponseModel(status=False, details="Society not found")
    if entity.diocese_id and not db.query(Diocese.id).filter(Diocese.id == entity.diocese_id).first():
        return ResponseModel(status=False, details="Diocese not found")

    # Check location validity
    locations = check_locations(db, province_id, entity.country_id, entity.state_id, entity.region_id, entity.district_id)
    if locations:
        return ResponseModel(status=False, details=locations)

    # Clean entity name and prepare code
    entity.name = " ".join(entity.name.split())
    entity.province_id = province_id
    entity.code = get_new_entity_id(entity.portfolio_id, db, portfolio_name)

    entity_users = entity.entity_user
    lefp = entity.lefp
    del entity.entity_user, entity.lefp

    # Step 1: Validate all LEFP entries
    entity_FP = list(map(lambda x: x['portfolio_id'], mapped_financial(db, entity.portfolio_id)[0]['financial_name']))
    validated_lefp_data = []

    for i in entity_FP:
        lefp_i = list(filter(lambda x: x.portfolio_id == i, lefp))

        number = name = lefp_users = None
        if lefp_i:
            lefp_i = lefp_i[0]
            number = str(lefp_i.number).strip() if lefp_i.number else ''
            name = lefp_i.name
            type = lefp_i.type
            lefp_users = lefp_i.lefp_user

            portfolio_name_i = db.query(Portfolio.name).filter(Portfolio.id == i).scalar()
            if number and not validate_identifier(portfolio_name_i, number):
                format_hint = FORMAT_HINTS.get(portfolio_name_i, "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {portfolio_name_i} Number format: '{number}'. Expected format: {format_hint}"
                )

        validated_lefp_data.append({
            "portfolio_id": i,
            "name": name,
            "number": number,
            "type": type,
            "lefp_users": lefp_users
        })

    # Step 2: All valid, proceed to insert
    try:
        entity_data = LegalEntity(**entity.model_dump(), created_by=curr_user.user_id, updated_by=curr_user.user_id)
        db.add(entity_data)
        db.commit()
        db.refresh(entity_data)

        # Add LegalEntity users
        if entity_users:
            le_users = []
            notifications = []
            for i in entity_users:
                if not bool(i):
                    continue
                le_user = LegalEntityUser(
                    legal_entity_id=entity_data.id,
                    user_id=i.user_id,
                    role_id=i.role_id,
                    created_by=curr_user.user_id,
                    updated_by=curr_user.user_id
                )
                le_users.append(le_user)

                # Notification for LegalEntityUser
                role_name = db.query(Role.name).filter(Role.id == i.role_id).scalar() or "Member"
                message = f"You are assigned as {role_name} to '{portfolio_name}' for '{entity_data.name}'."
                notifications.append(Notification(
                    user_id=i.user_id,
                    title=f"You are assigned to a {portfolio_name}",
                    message=message,
                    is_read=False
                ))

            db.add_all(le_users)
            db.add_all(notifications)
        db.commit()

        # Add LEFP and LEFPUsers (skip financial-only notifications)
       

        financial_skip_list = [i[0] for i in db.query(Portfolio.name).filter(Portfolio.type == "Financial").all()]
        for data in validated_lefp_data:
            lefp_data = LEFP(
                legal_entity_id=entity_data.id,
                portfolio_id=data["portfolio_id"],
                name=data["name"],
                number=data["number"],
                type= data["type"],
                created_by=curr_user.user_id,
                updated_by=curr_user.user_id
            )
            db.add(lefp_data)
            db.commit()
            db.refresh(lefp_data)

            if data["lefp_users"]:
                lefp_users = []
                notifications = []
                lefp_portfolio = db.query(Portfolio.name).filter(Portfolio.id == data["portfolio_id"]).scalar()

                
                for j in data["lefp_users"]:
                    if not bool(j):
                        continue
                    lefp_user = LEFPUser(
                        user_id=j.user_id,
                        lefp_id=lefp_data.id,
                        role_id=j.role_id,
                        created_by=curr_user.user_id,
                        updated_by=curr_user.user_id
                    )
                    lefp_users.append(lefp_user)

                    role_name = db.query(Role.name).filter(Role.id == j.role_id).scalar() or "Member"
                    message = f"You are assigned as {role_name} to '{portfolio_name}' for entity '{entity_data.name}'."
                    
                    if lefp_portfolio not in financial_skip_list:
                        notifications.append(Notification(
                            user_id=j.user_id,
                            title=f"You are assigned to a {portfolio_name}",
                            message=message,
                            is_read=False
                        ))

                    db.add_all(lefp_users)
                    db.add_all(notifications)
                    db.commit()

        return {"status": True, "details": f"{portfolio_name} added successfully"}

    except Exception as e:
        db.rollback()
        return ResponseModel(status=False, details=f"Error while creating entity: {str(e)}")

# Edit Entity
@router.put('/entity/{id}', response_model=ResponseModel)
def edit_entity(id: int, entity: LegalEntitySchema, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    portfolio_name = get_portfolio_name(entity.portfolio_id, db)
    existing_entity = db.query(LegalEntity).filter(LegalEntity.id == id).first()
    if not existing_entity:
        return ResponseModel(status=False, details=f"{portfolio_name} not found")

    # Validate related models
    if not db.query(Community).filter(Community.id == entity.community_id).first():
        return ResponseModel(status=False, details="Community not found")
    if entity.society_id and not db.query(Society).filter(Society.id == entity.society_id).first():
        return ResponseModel(status=False, details="Society not found")
    if entity.diocese_id and not db.query(Diocese).filter(Diocese.id == entity.diocese_id).first():
        return ResponseModel(status=False, details="Diocese not found")

    # Province restriction for non-super-admin
    if curr_user.role_id != secret.s_admin_role:
        province_id = existing_entity.province_id
    else:
        province_id = entity.province_id or existing_entity.province_id

    entity.province_id = province_id  # Ensure this is set before updating DB


    # Validate location hierarchy
    locations = check_locations(db, province_id, entity.country_id, entity.state_id, entity.region_id, entity.district_id)
    if locations:
        return ResponseModel(status=False, details=locations)

    # Validate LEFP entries
    validated_lefp_data = []
    for i in entity.lefp:
        portfolio_lefp = db.query(Portfolio.name).filter(Portfolio.id == i.portfolio_id).scalar()
        if not portfolio_lefp:
            return ResponseModel(status=False, details="Invalid portfolio_id in LEFP")

        number = str(i.number).strip() if i.number else ""
        if number and not validate_identifier(portfolio_lefp, number):
            format_hint = FORMAT_HINTS.get(portfolio_lefp, "No specific format provided.")
            return ResponseModel(
                status=False,
                details=f"Invalid {portfolio_lefp} Number format: '{number}'. Expected format: {format_hint}"
            )

        validated_lefp_data.append((i, portfolio_lefp, number))

    try:
        # Update main LegalEntity fields
        entity_data = entity.model_dump(exclude={"entity_user", "lefp", "code"}, exclude_unset=True)
        entity_data["name"] = " ".join(entity_data["name"].split())  # Clean name spacing
        for key, value in entity_data.items():
            setattr(existing_entity, key, value)
        existing_entity.updated_by = curr_user.user_id
        db.commit()

        # === LegalEntityUser ===
        existing_user_map = db.query(LegalEntityUser).filter(LegalEntityUser.legal_entity_id == id).all()
        keep_ids = []
        new_user_links = []
        notifications = []

        for user in entity.entity_user:
            match = next((x for x in existing_user_map if x.user_id == user.user_id and x.role_id == user.role_id), None)
            if match:
                keep_ids.append(match.id)
            elif user.user_id:
                new_user_links.append(LegalEntityUser(
                    legal_entity_id=id, user_id=user.user_id, role_id=user.role_id,
                    created_by=curr_user.user_id, updated_by=curr_user.user_id
                ))

                # Notify user
                role_name = db.query(Role.name).filter(Role.id == user.role_id).scalar() or "Member"
                notifications.append(Notification(
                    user_id=user.user_id,
                    title=f"You are assigned to a {portfolio_name}",
                    message=f"You are assigned as {role_name} to '{portfolio_name}' for '{existing_entity.name}'.",
                    is_read=False
                ))

        # Delete unmapped users
        db.query(LegalEntityUser).filter(
            LegalEntityUser.legal_entity_id == id,
            ~LegalEntityUser.id.in_(keep_ids)
        ).delete(synchronize_session=False)

        if new_user_links:
            db.add_all(new_user_links)
        if notifications:
            db.add_all(notifications)
        db.commit()

        # === LEFP Section ===
        existing_lefp_portfolios = []
        for lefp_item, portfolio_nam, number in validated_lefp_data:
            existing_lefp = db.query(LEFP).filter(
                LEFP.portfolio_id == lefp_item.portfolio_id,
                LEFP.legal_entity_id == id
            ).first()

            if not existing_lefp:
                lefp_data = LEFP(
                    legal_entity_id=id,
                    portfolio_id=lefp_item.portfolio_id,
                    name=lefp_item.name,
                    number=number,
                    type=lefp_item.type,
                    created_by=curr_user.user_id,
                    updated_by=curr_user.user_id
                )
                db.add(lefp_data)
                db.commit()
                db.refresh(lefp_data)
                lefp_id = lefp_data.id
            else:
                lefp_id = existing_lefp.id
                existing_lefp.name = lefp_item.name
                existing_lefp.number = number
                existing_lefp.type = lefp_item.type
                existing_lefp.updated_by = curr_user.user_id
                db.commit()

            # Handle LEFPUser mapping
            existing_lefp_users = db.query(LEFPUser).filter(LEFPUser.lefp_id == lefp_id).all()
            keep_user_ids = []
            new_lefp_users = []

            for j in lefp_item.lefp_user:
                user_id = j["user_id"] if isinstance(j, dict) else j.user_id
                role_id = j["role_id"] if isinstance(j, dict) else j.role_id
                match = next((x for x in existing_lefp_users if x.user_id == user_id and x.role_id == role_id), None)

                if match:
                    keep_user_ids.append(match.id)
                elif user_id:
                    new_lefp_users.append(LEFPUser(
                        user_id=user_id, role_id=role_id, lefp_id=lefp_id,
                        created_by=curr_user.user_id, updated_by=curr_user.user_id
                    ))

            db.query(LEFPUser).filter(
                LEFPUser.lefp_id == lefp_id,
                ~LEFPUser.id.in_(keep_user_ids)
            ).delete(synchronize_session=False)

            if new_lefp_users:
                db.add_all(new_lefp_users)
            db.commit()

            existing_lefp_portfolios.append(lefp_item.portfolio_id)

        # Remove LEFPs not in input
        stale_lefps = db.query(LEFP).filter(
            LEFP.legal_entity_id == id,
            ~LEFP.portfolio_id.in_(existing_lefp_portfolios)
        )
        for stale in stale_lefps:
            db.delete(stale)
        db.commit()

    except Exception as e:
        db.rollback()
        return ResponseModel(status=False, details=f"Error while updating: {str(e)}")

    return ResponseModel(status=True, details=f"{portfolio_name} details updated successfully")


# delete Legal Entity
@router.delete('/entity/{id}')
def delete_entity(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    
    # check permission
    if curr_user.role_id not in [secret.p_admin_role, secret.s_admin_role]:
        return ResponseModel(status=False, details=f"You don't have permission to delete")
    
    entity_data= db.query(LegalEntity).filter(LegalEntity.id == id)
    if not entity_data.first():
        return ResponseModel(status=False, details=f"Data not found")

    has_documents = db.query(Answer).filter(Answer.legal_entity_id == id).first()
    if has_documents:
        return ResponseModel(status=False, details="Cannot delete entity with associated documents")
    
    has_lefp = db.query(LEFP).filter(LEFP.legal_entity_id == id).all()
    has_lefp_documents = db.query(Answer).filter(Answer.lefp_id.in_([lefp.id for lefp in has_lefp])).all() if has_lefp else []
    if has_lefp_documents:
        return ResponseModel(status=False, details="Cannot delete entity with associated LEFP documents")
    
    
    portfolio_name= get_portfolio_name(entity_data.first().portfolio_id, db)
    db.delete(entity_data.first())
    db.commit()
    # legal entity user, lefp, lefpUser will be removed by cascade method
    return { "status": True,"details":f"{portfolio_name} deleted successfully" }


#import School using the Excel
@router.post("/school/import")
def import_schools(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")
    
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")
    
    # Read Excel file
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
        
    # Check if DataFrame is empty
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")  
    
    
    # Required Columns
    required_columns = {
        "Society", "Community", "School Name", "Place", "Address",
        "Country", "State", "Region", "District", "Financial Assistance", "Board", "Medium of Instruction", "Grade"
    }
    
    # Validate required columns
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")
    
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Schools").scalar()
    if not portfolio_id:
        return ResponseModel(status=False, details="Portfolio not found")
    
    # Get Province Locations
    locations = get_province_locations(province_id, db)
    school_name_list = db.query(LegalEntity).filter(LegalEntity.province_id == province_id, LegalEntity.portfolio_id == portfolio_id).all()
    school_name_list = list(map(lambda x: x.name, school_name_list))
    
    # School Financial Portfolio
    school_fp = list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, mapped_financial(db, portfolio_id)[0]['financial_name']))

    
    new_schools = []
    # Process each row and insert into database
    for index, (_, row) in enumerate(df.iterrows()):
        for field in required_columns:
            if not row.get(field):
                return ResponseModel(status=False, details=f"Missing '{field}' in row {index + 1}")
        if 'Community' not in row or not str(row['Community']).strip():
            return ResponseModel(status=False, details=f"Community is empty in row {index + 1}")
    
        if 'Society' not in row or not str(row['Society']).strip():
            return ResponseModel(status=False, details=f"Society is empty in row {index + 1}")
        
        if 'School Name' not in row or not str(row['School Name']).strip():
            return ResponseModel(status=False,details=f"School Name is empty in row{index + 1}")
        
        if 'Place' not in row or not str(row['Place']).strip():
            return ResponseModel(status=False,details=f"Place Name is empty in row{index + 1}")
        
        if 'Address' not in row or not str(row['Address']).strip():
            return ResponseModel(status=False,details=f"Address is empty in row{index + 1}")
        
        if 'Financial Assistance' not in row or not str(row['Financial Assistance']).strip():
            return ResponseModel(status=False,details=f"Financial Assistance is empty in row{index + 1}")
        
        if 'Board' not in row or not str(row['Board']).strip():
            return ResponseModel(status=False,details=f"Board is empty in row{index + 1}")
        
        if 'Medium of Instruction' not in row or not str(row['Medium of Instruction']).strip():
            return ResponseModel(status=False,details=f"Medium of Instruction is empty in row{index + 1}")
        
        if 'Grade' not in row or not str(row['Grade']).strip():
            return ResponseModel(status=False,details=f"Grade is empty in row{index + 1}")
        
        society_record = db.query(Society).filter(Society.name.ilike(row['Society'])).first()
        community_record = db.query(Community).filter(Community.name.ilike(row['Community'])).first()


        if not society_record:
            return ResponseModel(status=False, details=f"Society '{row['Society']} - in row {index + 1}' not found in database")
        if not community_record:
            return ResponseModel(status=False, details=f"Community '{row['Community']} - in row {index + 1}' not found in database")
        
        # if row.get('School Name', '') in list(map(lambda x: x['School Name'], new_schools)) or row.get('School Name', '') in school_name_list:
        #     return ResponseModel(status=False, details=f"School name '{row.get('School Name', '')}' already exists")
        
        # Input From User is Text
        country_id = list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state_id = list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region_id = list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district_id = list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))
        
        # Validate that all IDs were found
        if not country_id:
            return ResponseModel(status=False, details=f"Country '{row['Country']} - in row {index + 1}' not found in database")
        if not state_id:
            return ResponseModel(status=False, details=f"State '{row['State']} - in row {index + 1}' not found in database")
        if not region_id:
            return ResponseModel(status=False, details=f"Region '{row['Region']} - in row {index + 1}' not found in database")
        if not district_id:
            return ResponseModel(status=False, details=f"District '{row['District']} - in row {index + 1}' not found in database")
        
        temp = {
            "Society": society_record.name if society_record else None,
            "Community": community_record.name if community_record else None,
            "School Name": " ".join(row.get('School Name', '').split()),
            "place": row.get('Place', ''),
            "address": row.get('Address', ''),
            "Financial Assistance": row.get('Financial Assistance', ''),
            "Board": row.get('Board', ''),
            "Medium of Instruction": row.get('Medium of Instruction', ''),
            "Grade": row.get('Grade', ''),
            "country_id": country_id[0].id,
            "state_id": state_id[0].id,
            "region_id": region_id[0].id,
            "district_id": district_id[0].id,
            "lefp": []
        }
        
        for i in school_fp:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validate financial number format
            if not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'. Correct format: {format_hint}"
                )

            temp['lefp'].append({
                'portfolio_id': i['portfolio_id'],
                'number': number,
                'name': name,
                'type':type
            })
        
        new_schools.append(temp)
    
    new_ids = []
    # Insert into database
    for row in new_schools:
        try:
            new_school = LegalEntity(
                province_id=province_id, 
                code=get_new_entity_id(portfolio_id,db,"Schools"),
                society_id=society_record.id if society_record else None,
                community_id=community_record.id if community_record else None,
                name=row.get('School Name', ''), 
                place=row['place'], 
                address=row['address'], 
                country_id=row['country_id'], 
                state_id=row['state_id'], 
                region_id=row['region_id'], 
                district_id=row['district_id'],
                financial_assistance=row.get('Financial Assistance', ''),
                school_board=row.get('Board', ''),
                medium_of_instruction=row.get('Medium of Instruction', ''),
                grade=row.get('Grade', ''),
                portfolio_id=portfolio_id,created_by= curr_user.user_id, updated_by= curr_user.user_id

            )
            db.add(new_school)
            db.commit()
            db.refresh(new_school)
            new_ids.append(new_school.id)
            
            # Insert school financial portfolio (LEFP)
            db.add_all([
                LEFP(legal_entity_id=new_school.id, portfolio_id=i['portfolio_id'], name=i['name'], number=i['number'],type=i['type'], )
                for i in row['lefp'] if i['portfolio_id'] is not None
            ])
            db.commit()
        except Exception as e:
            # Delete created schools in case of an error
            db.query(LegalEntity).filter(LegalEntity.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding School {row['School Name']}: {str(e)}"}
    
    return {"status": True, "details": "Schools imported successfully"}








#import for College
@router.post("/college/import")
def import_college(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")
    
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")
    
    # Read Excel file
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
    
    # Check if DataFrame is empty
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")  
    
    
    # Required Columns
    required_columns = {
        "Society", "Community", "College Name", "Place", "Address",
        "Country", "State", "Region", "District", "Financial Assistance", "Affiliation", "Faculty", "UG/PG"
    }
    
    # Validate required columns
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")
    
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Colleges").scalar()
    if not portfolio_id:
        return ResponseModel(status=False, details="Portfolio not found")
    
    # Get Province Locations
    locations = get_province_locations(province_id, db)
    college_name_list = db.query(LegalEntity).filter(LegalEntity.province_id == province_id, LegalEntity.portfolio_id == portfolio_id).all()
    college_name_list = list(map(lambda x: x.name, college_name_list))
    
    # College Financial Portfolio
    college_Fp = list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, mapped_financial(db, portfolio_id)[0]['financial_name']))

    
    new_colleges = []
    # Process each row and insert into database
    for index, (_, row) in enumerate(df.iterrows()):
        for field in required_columns:
            if not row.get(field):
                return ResponseModel(status=False, details=f"Missing '{field}' in row {index + 1}")
            
        if 'Community' not in row or not str(row['Community']).strip():
            return ResponseModel(status=False, details=f"Community is empty in row {index + 1}")
    
        if 'Society' not in row or not str(row['Society']).strip():
            return ResponseModel(status=False, details=f"Society is empty in row {index + 1}")
        
        if 'College Name' not in row or not str(row['College Name']).strip():
            return ResponseModel(status=False,details=f"College Name is empty in row {index + 1}")
        
        if 'Financial Assistance' not in row or not str(row['Financial Assistance']).strip():
            return ResponseModel(status=False, details=f"Financial Assistance is empty in row {index + 1}")
        
        if 'Affiliation' not in row or not str(row['Affiliation']).strip():
            return ResponseModel(status=False, details=f"Affiliation is empty in row {index + 1}")
        
        if 'Faculty' not in row or not str(row['Faculty']).strip():
            return ResponseModel(status=False, details=f"Faculty is empty in row {index + 1}")
        
        if 'UG/PG' not in row or not str(row['UG/PG']).strip():
            return ResponseModel(status=False, details=f"UG/PG is empty in row {index + 1}")
        
        if 'Place' not in row or not str(row['Place']).strip():
            return ResponseModel(status=False, details=f"Place is empty in row {index + 1}")
        
        if 'Address' not in row or not str(row['Address']).strip():
            return ResponseModel(status=False, details=f"Address is empty in row {index + 1}")
        
        
        
        society_record = db.query(Society).filter(Society.name.ilike(row['Society'])).first()
        
        community_record = db.query(Community).filter(Community.name.ilike(row['Community'])).first()

        if not society_record:
            return ResponseModel(status=False, details=f"Society '{row['Society']} - in row {index + 1}' not found in database")
        if not community_record:
            return ResponseModel(status=False, details=f"Community '{row['Community']} - in row {index + 1}' not found in database")
        
        # if row.get('College Name', '') in list(map(lambda x: x['College Name'], new_colleges)) or row.get('College Name', '') in college_name_list:
        #     return ResponseModel(status=False, details=f"College name '{row.get('College Name', '')}' already exists")
        
        # Input From User is Text
        country_id = list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state_id = list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region_id = list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district_id = list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))
        
        # Validate that all IDs were found
        if not country_id:
            return ResponseModel(status=False, details=f"Country '{row['Country']} - in row {index + 1}' not found in database")
        if not state_id:
            return ResponseModel(status=False, details=f"State '{row['State']} - in row {index + 1}' not found in database")
        if not region_id:
            return ResponseModel(status=False, details=f"Region '{row['Region']} - in row {index + 1}' not found in database")
        if not district_id:
            return ResponseModel(status=False, details=f"District '{row['District']} - in row {index + 1}' not found in database")
        
        temp = {
            "Society": society_record if society_record else None,
            "Community": community_record if community_record else None,
            "College Name":" ".join(row.get('College Name', '').split()),
            "place": row.get('Place', ''),
            "address": row.get('Address', ''),
            "Financial Assistance": row.get('Financial Assistance', ''),
            "Faculty": row.get('Faculty', ''),
            "Affiliation": row.get('Affiliation', ''),
            "UG/PG": row.get('UG/PG', ''),
            "country_id": country_id[0].id,
            "state_id": state_id[0].id,
            "region_id": region_id[0].id,
            "district_id": district_id[0].id,
            "lefp": []
        }
        for i in college_Fp:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validate financial number format
            if not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'. Correct format: {format_hint}"
                )

            temp['lefp'].append({
                'portfolio_id': i['portfolio_id'],
                'number': number,
                'name': name
                ,'type':type
            })
        
        new_colleges.append(temp)
    
    new_ids = []
    # Insert into database
    for row in new_colleges:
        try:
            new_college = LegalEntity(
                province_id=province_id, 
                code=get_new_entity_id(portfolio_id,db,"Colleges"),
                society_id=society_record.id if society_record else None,
                community_id=community_record.id if community_record else None,
                name=row.get('College Name', ''), 
                place=row['place'], 
                address=row['address'], 
                country_id=row['country_id'], 
                state_id=row['state_id'], 
                region_id=row['region_id'], 
                district_id=row['district_id'],
                financial_assistance=row.get('Financial Assistance', ''),
                affiliation=row.get('Affiliation', ''),
                faculty=row.get('Faculty', ''),
                ug_pg=row.get('UG/PG', ''),
                portfolio_id=portfolio_id,created_by= curr_user.user_id, updated_by= curr_user.user_id

            )
            db.add(new_college)
            db.commit()
            db.refresh(new_college)
            new_ids.append(new_college.id)
            
            # Insert Colleges financial portfolio (LEFP)
            db.add_all([
                LEFP(legal_entity_id=new_college.id, portfolio_id=i['portfolio_id'], name=i['name'], number=i['number'],type=i['type'])
                for i in row['lefp'] if i['portfolio_id'] is not None
            ])
            db.commit()
        except Exception as e:
            # Delete created College in case of an error
            db.query(LegalEntity).filter(LegalEntity.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding College {row['College Name']}: {str(e)}"}
    
    return {"status": True, "details": "College imported successfully"}





#Technical-Institute import
@router.post("/technical-institute/import")
def import_technical_institute(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")
    
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")
    
    # Read Excel file
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
    
    # Check if DataFrame is empty
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")  
    
    
    # Required Columns
    required_columns = {
        "Society", "Community", "Name", "Place", "Address",
        "Country", "State", "Region", "District", "Financial Assistance", "TI Board", "Type"
    }
    
    # Validate required columns
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")
    
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Technical Institutions").scalar()
    if not portfolio_id:
        return ResponseModel(status=False, details="Portfolio not found")
    # Get Province Locations
    locations = get_province_locations(province_id, db)
    Technical_Institute_name_list = db.query(LegalEntity).filter(LegalEntity.province_id == province_id, LegalEntity.portfolio_id == portfolio_id).all()
    Technical_Institute_name_list = list(map(lambda x: x.name, Technical_Institute_name_list))
    
    # School Financial Portfolio
    Technical_Fp = list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, mapped_financial(db, portfolio_id)[0]['financial_name']))

    
    new_Technicals = []
    # Process each row and insert into database
    for index, (_, row) in enumerate(df.iterrows()):
        for field in required_columns:
            if field not in row or not str(row[field]).strip():
                return ResponseModel(status=False, details=f"'{field}' is empty in row {index + 1}")
        # if 'Community' not in row or not str(row['Community']).strip():
        #     return ResponseModel(status=False, details=f"Community is empty in row {index + 1}")
    
        # if 'Society' not in row or not str(row['Society']).strip():
        #     return ResponseModel(status=False, details=f"Society is empty in row {index + 1}")
        
        # if 'Name' not in row or not str(row['Name']).strip():
        #     return ResponseModel(status=False,details=f"Name is empty in row{index + 1}")
        
        # if 'Financial Assistance' not in row or not str(row['Financial Assistance']).strip():
        #     return ResponseModel(status=False,details=f"Financial Assistance is empty in row{index + 1}")
        
        # if 'TI Board' not in row or not str(row['TI Board']).strip():
        #     return ResponseModel(status=False,details=f"TI Board is empty in row{index + 1}")
        
        # if 'Type' not in row or not str(row['Type']).strip():
        #     return ResponseModel(status=False,details=f"Type is empty in row{index + 1}")
        
        # if 'Place' not in row or not str(row['Place']).strip():
        #     return ResponseModel(status=False,details=f"Place is empty in row{index + 1}")
        
        # if 'Address' not in row or not str(row['Address']).strip():
        #     return ResponseModel(status=False,details=f"Address is empty in row{index + 1}")
        
        society_record = db.query(Society).filter(Society.name.ilike(row['Society'])).first()
        community_record = db.query(Community).filter(Community.name.ilike(row['Community'])).first()


        if not society_record:
            return ResponseModel(status=False, details=f"Society '{row['Society']} - in row {index + 1}' not found in database")
        if not community_record:
            return ResponseModel(status=False, details=f"Community '{row['Community']} - in row {index + 1}' not found in database")
        
        # if row.get('Name', '') in list(map(lambda x: x['Name'], new_Technicals)) or row.get('College Name', '') in Technical_Institute_name_list:
        #     return ResponseModel(status=False, details=f"Technical name '{row.get('Name', '')}' already exists")
        
        # Input From User is Text
        country_id = list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state_id = list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region_id = list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district_id = list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))
        
        # Validate that all IDs were found
        if not country_id:
            return ResponseModel(status=False, details=f"Country '{row['Country']} - in row {index + 1}' not found in database")
        if not state_id:
            return ResponseModel(status=False, details=f"State '{row['State']} - in row {index + 1}' not found in database")
        if not region_id:
            return ResponseModel(status=False, details=f"Region '{row['Region']} - in row {index + 1}' not found in database")
        if not district_id:
            return ResponseModel(status=False, details=f"District '{row['District']} - in row {index + 1}' not found in database")
        
        temp = {
            "Society": society_record.name if society_record else None,
            "Community": community_record.name if community_record else None,
            "Name": " ".join(row.get('Name', '').split()),
            "place": row.get('Place', ''),
            "address": row.get('Address', ''),
            "Financial Assistance": row.get('Financial Assistance', ''),
            "Board": row.get('TI Board', ''),
            "Type": row.get('Type', ''),
            "country_id": country_id[0].id,
            "state_id": state_id[0].id,
            "region_id": region_id[0].id,
            "district_id": district_id[0].id,
            "lefp": []
        }
        
        for i in Technical_Fp:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validate financial number format
            if  not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'. Correct format: {format_hint}"
                )

            temp['lefp'].append({
                'portfolio_id': i['portfolio_id'],
                'number': number,
                'name': name
                ,'type':type
            })
        
        new_Technicals.append(temp)
    
    new_ids = []
    # Insert into database
    for row in new_Technicals:
        try:
            new_Technical = LegalEntity(
                province_id=province_id, 
                code=get_new_entity_id(portfolio_id,db,"Technical Institutions"),
                society_id=society_record.id if society_record else None,
                community_id=community_record.id if community_record else None,
                name=row.get('Name', ''), 
                place=row['place'], 
                address=row['address'], 
                country_id=row['country_id'], 
                state_id=row['state_id'], 
                region_id=row['region_id'], 
                district_id=row['district_id'],
                financial_assistance=row.get('Financial Assistance', ''),
                board=row.get('Board', ''),
                type=row.get('Type', ''),
                portfolio_id=portfolio_id,created_by= curr_user.user_id, updated_by= curr_user.user_id

            )
            db.add(new_Technical)
            db.commit()
            db.refresh(new_Technical)
            new_ids.append(new_Technical.id)
            
            # Insert Technical Institutions financial portfolio (LEFP)
            db.add_all([
                LEFP(legal_entity_id=new_Technical.id, portfolio_id=i['portfolio_id'], name=i['name'], number=i['number'],type=i['type'])
                for i in row['lefp'] if i['portfolio_id'] is not None
            ])
            db.commit()
        except Exception as e:
            # Delete created Technical Institutions in case of an error
            db.query(LegalEntity).filter(LegalEntity.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding Technical Institutions {row['Name']}: {str(e)}"}
    
    return {"status": True, "details": "Technical Institutions imported successfully"}










#import for Boarding and Hostel
@router.post("/boarding-hostel/import")
def import_Boarding_Hostel(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")
    
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")
    
    # Read Excel file
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
    
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")
    # Required Columns
    required_columns = {
        "Society", "Community","Type", "Name", "Place", "Address",
        "Country", "State", "Region", "District"
    }
    
    # Validate required columns
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")
    
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Boarding and Hostel").scalar()
    if not portfolio_id:
        return ResponseModel(status=False, details="Boarding and Hostel portfolio not found")
    
    # Get Province Locations
    locations = get_province_locations(province_id, db)
    Boarding_Hostel_name_list = db.query(LegalEntity).filter(LegalEntity.province_id == province_id, LegalEntity.portfolio_id == portfolio_id).all()
    Boarding_Hostel_name_list = list(map(lambda x: x.name, Boarding_Hostel_name_list))
    
    # Boarding and Hostel Financial Portfolio

    Boarding_Hostel_Fp = list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, mapped_financial(db, portfolio_id)[0]['financial_name']))

    
    new_Boarding_Hostel = []
    # Process each row and insert into database
    for index, (_, row) in enumerate(df.iterrows()):
        if 'Community' not in row or not str(row['Community']).strip():
            return ResponseModel(status=False, details=f"Community is empty in row {index + 1}")
    
        if 'Society' not in row or not str(row['Society']).strip():
            return ResponseModel(status=False, details=f"Society is empty in row {index + 1}")
        
        if 'Name' not in row or not str(row['Name']).strip():
            return ResponseModel(status=False,details=f"Name is empty in row{index + 1}")
        
        if 'Type' not in row or not str(row['Type']).strip():
            return ResponseModel(status=False,details=f"Type is empty in row{index + 1}")
        
        if 'Place' not in row or not str(row['Place']).strip():
            return ResponseModel(status=False,details=f"Place is empty in row{index + 1}")
        
        if 'Address' not in row or not str(row['Address']).strip():
            return ResponseModel(status=False,details=f"Address is empty in row{index + 1}")
        
        
        society_record = db.query(Society).filter(Society.name.ilike(row['Society'])).first()
        community_record = db.query(Community).filter(Community.name.ilike(row['Community'])).first()


        if not society_record:
            return ResponseModel(status=False, details=f"Society '{row['Society']} - in row {index + 1}' not found in database")
        if not community_record:
            return ResponseModel(status=False, details=f"Community '{row['Community']} - in row {index + 1}' not found in database")
        
        # if row.get('Name', '') in list(map(lambda x: x['Name'], new_Boarding_Hostel)) or row.get('Name', '') in Boarding_Hostel_name_list:
        #     return ResponseModel(status=False, details=f"Boarding and Hostel name '{row.get('Name', '')}' already exists")
        
        # Input From User is Text
        country_id = list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state_id = list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region_id = list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district_id = list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))
        
        # Validate that all IDs were found
        if not country_id:
            return ResponseModel(status=False, details=f"Country '{row['Country']} - in row {index + 1}' not found in database")
        if not state_id:
            return ResponseModel(status=False, details=f"State '{row['State']} - in row {index + 1}' not found in database")
        if not region_id:
            return ResponseModel(status=False, details=f"Region '{row['Region']} - in row {index + 1}' not found in database")
        if not district_id:
            return ResponseModel(status=False, details=f"District '{row['District']} - in row {index + 1}' not found in database")
        
        temp = {
            "Society": society_record.name if society_record else None,
            "Community": community_record.name if community_record else None,
            "Type":row.get('Type',''),
            "Name": " ".join(row.get('Name', '').split()),
            "place": row.get('Place', ''),
            "address": row.get('Address', ''),
            "country_id": country_id[0].id,
            "state_id": state_id[0].id,
            "region_id": region_id[0].id,
            "district_id": district_id[0].id,
            "lefp": []
        }
        
        for i in Boarding_Hostel_Fp:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validate financial number format
            if  not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'. Correct format: {format_hint}"
                )

            temp['lefp'].append({
                'portfolio_id': i['portfolio_id'],
                'number': number,
                'name': name
                ,'type':type
            })
        
        new_Boarding_Hostel.append(temp)
    
    new_ids = []
    # Insert into database
    for row in new_Boarding_Hostel:
        try:
            new_Boarding_Hostels = LegalEntity(
                province_id=province_id, 
                code=get_new_entity_id(portfolio_id,db,"Boarding and Hostel"),
                society_id=society_record.id if society_record else None,
                community_id=community_record.id if community_record else None,
                type=row.get('Type',''),
                name=row.get('Name', ''), 
                place=row['place'], 
                address=row['address'], 
                country_id=row['country_id'], 
                state_id=row['state_id'], 
                region_id=row['region_id'], 
                district_id=row['district_id'],
                portfolio_id=portfolio_id,created_by= curr_user.user_id, updated_by= curr_user.user_id

            )
            db.add(new_Boarding_Hostels)
            db.commit()
            db.refresh(new_Boarding_Hostels)
            new_ids.append(new_Boarding_Hostels.id)
            
            # Insert Boarding and Hostel financial portfolio (LEFP)
            db.add_all([
                LEFP(legal_entity_id=new_Boarding_Hostels.id, portfolio_id=i['portfolio_id'], name=i['name'], number=i['number'],type=i['type'])
                for i in row['lefp'] if i['portfolio_id'] is not None
            ])
            db.commit()
        except Exception as e:
            # Delete created Boarding and Hostel in case of an error
            db.query(LegalEntity).filter(LegalEntity.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding Boarding and Hostel {row['Name']}: {str(e)}"}
    
    return {"status": True, "details": "Boarding and Hostel imported successfully"}








#import for Departments 
@router.post("/departments/import")
def import_departments(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")
    
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")
    
    # Read Excel file
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
        
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")
    
    # Required Columns
    required_columns = {
        "Society", "Community", "Department Name", "Place", "Address",
        "Country", "State", "Region", "District"
    }
    
    # Validate required columns
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")
    
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Departments").scalar()
    if not portfolio_id:
        return ResponseModel(status=False, details="Departments Financial Portfolio not found")
    
    # Get Province Locations
    locations = get_province_locations(province_id, db)
    Departments_name_list = db.query(LegalEntity).filter(LegalEntity.province_id == province_id, LegalEntity.portfolio_id == portfolio_id).all()
    Departments_name_list = list(map(lambda x: x.name, Departments_name_list))
    
    # Departments Financial Portfolio

    Departments_Fp = list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, mapped_financial(db, portfolio_id)[0]['financial_name']))

    
    new_Departments = []
    # Process each row and insert into database
    for index, (_, row) in enumerate(df.iterrows()):
        if 'Community' not in row or not str(row['Community']).strip():
            return ResponseModel(status=False, details=f"Community is empty in row {index + 1}")
    
        if 'Society' not in row or not str(row['Society']).strip():
            return ResponseModel(status=False, details=f"Society is empty in row {index + 1}")
        
        if 'Department Name' not in row or not str(row['Department Name']).strip():
            return ResponseModel(status=False,details=f"Department Name is empty in row {index + 1}")
        
        if 'Place' not in row or not str(row['Place']).strip():
            return ResponseModel(status=False,details=f"Place is empty in row{index + 1}")
        
        if 'Address' not in row or not str(row['Address']).strip():
            return ResponseModel(status=False,details=f"Address is empty in row{index + 1}")
        
        society_record = db.query(Society).filter(Society.name.ilike(row['Society'])).first()
        community_record = db.query(Community).filter(Community.name.ilike(row['Community'])).first()


        if not society_record:
            return ResponseModel(status=False, details=f"Society '{row['Society']} - in row {index + 1}' not found in database")
        if not community_record:
            return ResponseModel(status=False, details=f"Community '{row['Community']} - in row {index + 1}' not found in database")

        
        # if row.get('Department Name', '') in list(map(lambda x: x['Name'], new_Departments)) or row.get('Department Name', '') in Departments_name_list:
        #     return ResponseModel(status=False, details=f"Department name'{row.get('Department Name', '')}' already exists")
        
        # Input From User is Text
        country_id = list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state_id = list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region_id = list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district_id = list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))
        
        # Validate that all IDs were found
        if not country_id:
            return ResponseModel(status=False, details=f"Country '{row['Country']} - in row {index + 1}' not found in database")
        if not state_id:
            return ResponseModel(status=False, details=f"State '{row['State']} - in row {index + 1}' not found in database")
        if not region_id:
            return ResponseModel(status=False, details=f"Region '{row['Region']} - in row {index + 1}' not found in database")
        if not district_id:
            return ResponseModel(status=False, details=f"District '{row['District']} - in row {index + 1}' not found in database")
        
        temp = {
            "Community": community_record.name if community_record else None,
            "Society": society_record.name if society_record else None,
            "Department Name": " ".join(row.get('Department Name', '').split()),
            "place": row.get('Place', ''),
            "address": row.get('Address', ''),
            "country_id": country_id[0].id,
            "state_id": state_id[0].id,
            "region_id": region_id[0].id,
            "district_id": district_id[0].id,
            "lefp": []
        }
        
        for i in Departments_Fp:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validate financial number format
            if  not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'. Correct format: {format_hint}"
                )

            temp['lefp'].append({
                'portfolio_id': i['portfolio_id'],
                'number': number,
                'name': name,
                'type': type
            })
        
        new_Departments.append(temp)
    
    new_ids = []
    # Insert into database
    for row in new_Departments:
        try:
            new_Department = LegalEntity(
                province_id=province_id, 
                code=get_new_entity_id(portfolio_id,db,"Departments"),
                society_id=society_record.id if society_record else None,
                community_id=community_record.id if community_record else None,
                name=row.get('Department Name', ''), 
                place=row['place'], 
                address=row['address'], 
                country_id=row['country_id'], 
                state_id=row['state_id'], 
                region_id=row['region_id'], 
                district_id=row['district_id'],
                portfolio_id=portfolio_id,created_by= curr_user.user_id, updated_by= curr_user.user_id

            )
            db.add(new_Department)
            db.commit()
            db.refresh(new_Department)
            new_ids.append(new_Department.id)
            
            # Insert Departments financial portfolio (LEFP)
            db.add_all([
                LEFP(legal_entity_id=new_Department.id, portfolio_id=i['portfolio_id'], name=i['name'], number=i['number'],type=i['type'])
                for i in row['lefp'] if i['portfolio_id'] is not None
            ])
            db.commit()
        except Exception as e:
            # Delete created Departments in case of an error
            db.query(LegalEntity).filter(LegalEntity.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding Departments {row['Name']}: {str(e)}"}
    
    return {"status": True, "details": "Departments imported successfully"}








#import for Social Sectors 
@router.post("/social-sectors/import")
def import_social_sectors(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")
    
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")
    
    # Read Excel file
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)

    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")
        
    
    
    # Required Columns
    required_columns = {
         "Community", "Society","Social Sectors Name", "Place", "Address",
         "Country", "State", "Region", "District"
    }
    
    # Validate required columns
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {', '.join(missing_columns)}")
    
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Social Sectors").scalar()
    if not portfolio_id:
        return ResponseModel(status=False, details="Social Sectors Portfolio not found")
    
    # Get Province Locations
    locations = get_province_locations(province_id, db)
    Social_Sectors_name_list = db.query(LegalEntity).filter(LegalEntity.province_id == province_id, LegalEntity.portfolio_id == portfolio_id).all()
    Social_Sectors_name_list = list(map(lambda x: x.name, Social_Sectors_name_list))
    
    # School Financial Portfolio
    Social_Sectors_Fp = list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, mapped_financial(db, portfolio_id)[0]['financial_name']))

    
    new_Social_Sectors = []
    # Process each row and insert into database
    for index, (_, row) in enumerate(df.iterrows()):
        # Validate required text fields are not empty
        if 'Community' not in row or not str(row['Community']).strip():
            return ResponseModel(status=False, details=f"Community is empty in row {index + 1}")
    
        if 'Society' not in row or not str(row['Society']).strip():
            return ResponseModel(status=False, details=f"Society is empty in row {index + 1}")
        
        if 'Social Sectors Name' not in row or not str(row['Social Sectors Name']).strip():
            return ResponseModel(status=False,details=f"Social Sectors Name is empty in row {index + 1}")
        
        if 'Place' not in row or not str(row['Place']).strip():
            return ResponseModel(status=False,details=f"Place is empty in row{index + 1}")
        
        if 'Address' not in row or not str(row['Address']).strip():
            return ResponseModel(status=False,details=f"Address is empty in row{index + 1}")
        



        society_record = db.query(Society).filter(Society.name.ilike(row['Society'])).first()
        community_name = " ".join(row['Community'].strip().split()).lower()
        community_record = db.query(Community).filter(func.lower(Community.name) == community_name).first()

        if not society_record:
            return ResponseModel(status=False, details=f"Society '{row['Society']} - in row {index + 1}' not found in database")
        if not community_record:
            return ResponseModel(status=False, details=f"Community '{row['Community']} - in row {index + 1}' not found in database")

        
        # if row.get('Social Sectors Name', '') in list(map(lambda x: x['Name'], new_Social_Sectors)) or row.get('Social Sectors Name', '') in Social_Sectors_name_list:
        #     return ResponseModel(status=False, details=f"Social Sectors name'{row.get('Social Sectors Name', '')}' already exists")
        
        # Input From User is Text
        country_id = list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state_id = list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region_id = list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district_id = list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))
        
        # Validate that all IDs were found
        if not country_id:
            return ResponseModel(status=False, details=f"Country '{row['Country']} - in row {index + 1}' not found in database")
        if not state_id:
            return ResponseModel(status=False, details=f"State '{row['State']} - in row {index + 1}' not found in database")
        if not region_id:
            return ResponseModel(status=False, details=f"Region '{row['Region']} - in row {index + 1}' not found in database")
        if not district_id:
            return ResponseModel(status=False, details=f"District '{row['District']} - in row {index + 1}' not found in database")
        
        temp = {
            "Community": community_record.name if community_record else None,
            "Society": society_record.name if society_record else None,
            "Social Sectors Name": " ".join(row.get('Social Sectors Name', '').split()),
            "place": row.get('Place', ''),
            "address": row.get('Address', ''),
            "country_id": country_id[0].id,
            "state_id": state_id[0].id,
            "region_id": region_id[0].id,
            "district_id": district_id[0].id,
            "lefp": []
        }

        
        for i in Social_Sectors_Fp:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validate financial number format
            if  not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'. Correct format: {format_hint}"
                )

            temp['lefp'].append({
                'portfolio_id': i['portfolio_id'],
                'number': number,
                'name': name
                ,'type':type
            })
        
        new_Social_Sectors.append(temp)
    
    new_ids = []
    # Insert into database
    for row in new_Social_Sectors:
        try:
            new_Social_Sector = LegalEntity(
                province_id=province_id, 
                code=get_new_entity_id(portfolio_id,db,"Social Sectors"),
                community_id=community_record.id if community_record else None,
                society_id=society_record.id if society_record else None,
                name=row.get('Social Sectors Name', ''), 
                place=row['place'], 
                address=row['address'], 
                country_id=row['country_id'], 
                state_id=row['state_id'], 
                region_id=row['region_id'], 
                district_id=row['district_id'],
                portfolio_id=portfolio_id,
                created_by=curr_user.user_id,
                updated_by=curr_user.user_id
            )
            db.add(new_Social_Sector)
            db.commit()
            db.refresh(new_Social_Sector)
            new_ids.append(new_Social_Sector.id)
            
            # Insert Social Sectors financial portfolio (LEFP)
            db.add_all([
                LEFP(legal_entity_id=new_Social_Sector.id, portfolio_id=i['portfolio_id'], name=i['name'], number=i['number'],type=i['type'])
                for i in row['lefp'] if i['portfolio_id'] is not None
            ])
            db.commit()
        except Exception as e:
            # Delete created Social_Sector in case of an error
            db.query(LegalEntity).filter(LegalEntity.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding Social Sectors {row['Name']}: {str(e)}"}
    
    return {"status": True, "details": "Social Sectors imported successfully"}






#import for Companies 
@router.post("/companies/import")
def import_companies(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")
    
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")
    
    # Read Excel file
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
        
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")
    
    # Required Columns
    required_columns = {
        "Community", "Company Name", "Place", "Address",
        "Country", "State", "Region", "District"
    }
    
    # Validate required columns
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")

    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Companies").scalar()
    if not portfolio_id:
        return ResponseModel(status=False, details="Portfolio not found")
    # Get Province Locations
    locations = get_province_locations(province_id, db)
    Companies_name_list = db.query(LegalEntity).filter(LegalEntity.province_id == province_id, LegalEntity.portfolio_id == portfolio_id).all()
    Companies_name_list = list(map(lambda x: x.name, Companies_name_list))
    
    # Companies Financial Portfolio   
    Companies_Fp = list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, mapped_financial(db, portfolio_id)[0]['financial_name']))

    
    new_Companies = []
    # Process each row and insert into database
    for index, (_, row) in enumerate(df.iterrows()):
        if 'Community' not in row or not str(row['Community']).strip():
            return ResponseModel(status=False, details=f"Community is empty in row {index + 1}")
        
        if 'Company Name' not in row or not str(row['Company Name']).strip():
            return ResponseModel(status=False,details=f"Company Name is empty in row{index + 1}")
        
        if 'Place' not in row or not str(row['Place']).strip():
            return ResponseModel(status=False,details=f"Place is empty in row{index + 1}")
        
        if 'Address' not in row or not str(row['Address']).strip():
            return ResponseModel(status=False,details=f"Address is empty in row{index + 1}")
        
        community_record = db.query(Community).filter(Community.name.ilike(row['Community'])).first()

        if not community_record:
            return ResponseModel(status=False, details=f"Community '{row['Community']} - in row {index + 1}' not found in database")
        
        # if row.get('Company Name', '') in list(map(lambda x: x['Name'], new_Companies)) or row.get('Company Name', '') in Companies_name_list:
        #     return ResponseModel(status=False, details=f"Company Name '{row.get('Company Name', '')}' already exists")
        
        # Input From User is Text
        country_id = list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state_id = list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region_id = list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district_id = list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))
        
        # Validate that all IDs were found
        if not country_id:
            return ResponseModel(status=False, details=f"Country '{row['Country']} - in row {index + 1}' not found in database")
        if not state_id:
            return ResponseModel(status=False, details=f"State '{row['State']} - in row {index + 1}' not found in database")
        if not region_id:
            return ResponseModel(status=False, details=f"Region '{row['Region']} - in row {index + 1}' not found in database")
        if not district_id:
            return ResponseModel(status=False, details=f"District '{row['District']} - in row {index + 1}' not found in database")
        
        temp = {
            "Community": community_record.name if community_record else None,
            "Company Name": " ".join(row.get('Company Name', '').split()),
            "place": row.get('Place', ''),
            "address": row.get('Address', ''),
            "country_id": country_id[0].id,
            "state_id": state_id[0].id,
            "region_id": region_id[0].id,
            "district_id": district_id[0].id,
            "lefp": []
        }
        
        for i in Companies_Fp:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validate financial number format
            if not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'. Correct format: {format_hint}"
                )

            temp['lefp'].append({
                'portfolio_id': i['portfolio_id'],
                'number': number,
                'name': name,
                'type': type
            })
        
        new_Companies.append(temp)
    
    new_ids = []
    # Insert into database
    for row in new_Companies:
        try:
            new_Companie = LegalEntity(
                province_id=province_id, 
                code=get_new_entity_id(portfolio_id,db,"Companies"),
                community_id=community_record.id if community_record else None,
                name=row.get('Company Name', ''), 
                place=row['place'], 
                address=row['address'], 
                country_id=row['country_id'], 
                state_id=row['state_id'], 
                region_id=row['region_id'], 
                district_id=row['district_id'],
                portfolio_id=portfolio_id,created_by= curr_user.user_id, updated_by= curr_user.user_id

            )
            db.add(new_Companie)
            db.commit()
            db.refresh(new_Companie)
            new_ids.append(new_Companie.id)
            
            # Insert Companies financial portfolio (LEFP)
            db.add_all([
                LEFP(legal_entity_id=new_Companie.id, portfolio_id=i['portfolio_id'], name=i['name'], number=i['number'], type=i['type'])
                for i in row['lefp'] if i['portfolio_id'] is not None
            ])
            db.commit()
        except Exception as e:
            # Delete created Companies in case of an error
            db.query(LegalEntity).filter(LegalEntity.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding Companies {row['Name']}: {str(e)}"}
    
    return {"status": True, "details": "Companies imported successfully"}



#import for Parishes 
@router.post("/parishes/import")
def import_parishes(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseModel(status=False, details="Province not found")
    
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseModel(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")
    
    # Read Excel file
    contents = file.file.read()
    if any(file.filename.endswith(ext) for ext in allowed[:-1]):
        df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
    else:
        df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
    
    # Check if DataFrame is empty
    if df.empty:
        return ResponseModel(status=False, details="The uploaded file is empty. No data to import.")  
    
    
    # Required Columns
    required_columns = {
        "Diocese","Society", "Community", "Name", "Place", "Address",
        "Country", "State", "Region", "District"
    }
    
    # Validate required columns
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseModel(status=False, details=f"Missing required columns: {missing_columns}")
    
    portfolio_id = db.query(Portfolio.id).filter(Portfolio.name == "Parishes").scalar()
    if not portfolio_id:
        return ResponseModel(status=False, details="Parishes Portfolio not found")
    # Get Province Locations
    locations = get_province_locations(province_id, db)
    Parishes_name_list = db.query(LegalEntity).filter(LegalEntity.province_id == province_id, LegalEntity.portfolio_id == portfolio_id).all()
    Parishes_name_list = list(map(lambda x: x.name, Parishes_name_list))
    
    # Parishes Financial Portfolio
    Parishes_Fp = list(map(lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, mapped_financial(db, portfolio_id)[0]['financial_name']))

    
    new_Parishes = []
    # Process each row and insert into database
    for index, (_, row) in enumerate(df.iterrows()):
        for field in required_columns:
            if not row.get(field):
                return ResponseModel(status=False, details=f"Missing '{field}' in row {index + 1}")
        
        if 'Community' not in row or not str(row['Community']).strip():
            return ResponseModel(status=False, details=f"Community is empty in row {index + 1}")
    
        if 'Society' not in row or not str(row['Society']).strip():
            return ResponseModel(status=False, details=f"Society is empty in row {index + 1}")
        
        if 'Diocese' not in row or not str(row['Diocese']).strip():
            return ResponseModel(status=False, details=f"Diocese is empty in row {index + 1}")
        
        if 'Name' not in row or not str(row['Name']).strip():
            return ResponseModel(status=False,details=f"Name is empty in row{index + 1}")
        
        if 'Place' not in row or not str(row['Place']).strip():
            return ResponseModel(status=False,details=f"Place is empty in row{index + 1}")
        
        if 'Address' not in row or not str(row['Address']).strip():
            return ResponseModel(status=False,details=f"Address is empty in row{index + 1}")
        
        society_record = db.query(Society).filter(Society.name.ilike(row['Society'])).first()
        community_record = db.query(Community).filter(Community.name.ilike(row['Community'])).first()
        Diocese_record = db.query(Diocese).filter(Diocese.name.ilike(row['Diocese'])).first()


        if not society_record:
            return ResponseModel(status=False, details=f"Society '{row['Society']} - in row {index + 1}' not found in database")
        if not community_record:
            return ResponseModel(status=False, details=f"Community '{row['Community']} - in row {index + 1}' not found in database")
        if not Diocese_record:
            return ResponseModel(status=False, details=f"Diocese '{row['Diocese']} - in row {index + 1}' not found in database")
        
        # if row.get('Name', '') in list(map(lambda x: x['Name'], new_Parishes)) or row.get('Name', '') in Parishes_name_list:
        #     return ResponseModel(status=False, details=f"Parishes name '{row.get('Name', '')}' already exists")
        
        # Input From User is Text
        country_id = list(filter(lambda x: x.name.lower() == row['Country'].lower(), locations['countries']))
        state_id = list(filter(lambda x: x.name.lower() == row['State'].lower(), locations['states']))
        region_id = list(filter(lambda x: x.name.lower() == row['Region'].lower(), locations['regions']))
        district_id = list(filter(lambda x: x.name.lower() == row['District'].lower(), locations['districts']))
        
        # Validate that all IDs were found
        if not country_id:
            return ResponseModel(status=False, details=f"Country '{row['Country']} - in row {index + 1}' not found in database")
        if not state_id:
            return ResponseModel(status=False, details=f"State '{row['State']} - in row {index + 1}' not found in database")
        if not region_id:
            return ResponseModel(status=False, details=f"Region '{row['Region']} - in row {index + 1}' not found in database")
        if not district_id:
            return ResponseModel(status=False, details=f"District '{row['District']} - in row {index + 1}' not found in database")
                
        temp = {
            "Society": society_record.name if society_record else None,
            "Community": community_record.name if community_record else None,
            "Diocese": Diocese_record.name if Diocese_record else None,
            "Name": " ".join(row.get('Name', '').split()),
            "place": row.get('Place', ''),
            "address": row.get('Address', ''),
            "country_id": country_id[0].id,
            "state_id": state_id[0].id,
            "region_id": region_id[0].id,
            "district_id": district_id[0].id,
            "lefp": []
        }
        
        for i in Parishes_Fp:
            number = str(row.get(f"{i['name']} Number", '')).strip()
            name = row.get(f"{i['name']} Name", '').strip()
            type = row.get(f"{i['name']} Type", '').strip()
            # Validate financial number format
            if  not validate_identifier(i["name"], number):
                format_hint = FORMAT_HINTS.get(i["name"], "")
                return ResponseModel(
                    status=False,
                    details=f"Invalid {i['name']} Number format in row {index + 1}: '{number}'. Correct format: {format_hint}"
                )

            temp['lefp'].append({
                'portfolio_id': i['portfolio_id'],
                'number': number,
                'name': name,
                'type': type
            })

        
        new_Parishes.append(temp)
    
    new_ids = []
    # Insert into database
    for row in new_Parishes:
        try:
            new_Parishe = LegalEntity(
                province_id=province_id, 
                code=get_new_entity_id(portfolio_id,db,"Parishes"),
                society_id=society_record.id if society_record else None,
                community_id=community_record.id if community_record else None,
                diocese_id=Diocese_record.id if Diocese_record else None,
                name=row.get('Name', ''), 
                place=row['place'], 
                address=row['address'], 
                country_id=row['country_id'], 
                state_id=row['state_id'], 
                region_id=row['region_id'], 
                district_id=row['district_id'],
                portfolio_id=portfolio_id,created_by= curr_user.user_id, updated_by= curr_user.user_id

            )
            db.add(new_Parishe)
            db.commit()
            db.refresh(new_Parishe)
            new_ids.append(new_Parishe.id)
            
            # Insert Parishes financial portfolio (LEFP)
            db.add_all([
                LEFP(legal_entity_id=new_Parishe.id, portfolio_id=i['portfolio_id'], name=i['name'], number=i['number'], type=i['type'])
                for i in row['lefp'] if i['portfolio_id'] is not None
            ])
            db.commit()
        except Exception as e:
            # Delete created Parishes in case of an error
            db.query(LegalEntity).filter(LegalEntity.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding Parishes {row['Name']}: {str(e)}"}
    
    return {"status": True, "details": "Parishes imported successfully"}







#Rough portfolio by export
def get_columns_by_portfolio(portfolio_name):
    portfolio_columns = {
        "Schools": ["S.NO","Code","School Name", "Financial Assistance", "Board", "Medium of Instruction", "Grade","Place", "Address","Country", "State", "Region", "District"],
        "Companies": [ "S.NO","Code", "Company Name", "Place", "Address","Country", "State", "Region", "District"],
        "Departments": ["S.NO","Code","Department Name", "Place", "Address","Country", "State", "Region", "District"],
        "Social Sectors": ["S.NO","Code","Social Sectors Name", "Place", "Address","Country", "State", "Region", "District"],
        "Parishes": ["S.NO","Code","Name", "Place", "Address","Country", "State", "Region", "District"],
        "Technical Institutions": ["S.NO","Code","Name", "Financial Assistance", "TI Board", "Type","Place", "Address","Country", "State", "Region", "District"],
        "Colleges": ["S.NO","Code","College Name","Financial Assistance", "Affiliation", "Faculty", "UG/PG", "Place", "Address","Country", "State", "Region", "District"],
        "Boarding and Hostel":[ "S.NO","Code","Type", "Name", "Place", "Address","Country", "State", "Region", "District"]

    }
    return portfolio_columns.get(portfolio_name, ['ID', 'Name'])

@router.get("/entity-portfolio/export")
def export_entity(portfolio_id: int, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Fetch portfolio name
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        return {"error": "Invalid portfolio ID"}

    
    if portfolio:
        # Get LEFP names (like TAN, PAN, etc.)
        portfolio_FP = list(map(
            lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, 
            mapped_financial(db, portfolio.id)[0]['financial_name']
        ))
    else:
        portfolio_FP = []
        
    columns = get_columns_by_portfolio(portfolio.name if portfolio else "")

    # Fetch entity data with LEFP relationships
    query = db.query(LegalEntity).filter(LegalEntity.portfolio_id == portfolio_id)
    query = authenticate_permission(curr_user, db, query, LegalEntity, "legal_entity")
    entities = query.order_by(LegalEntity.name.asc()).all()


    # Prepare data for Excel export
    entity_data = []
    for index, entity in enumerate(entities):
        temp = {"S.NO": index + 1, "Code": entity.code}
        
        # Add general entity details dynamically
        if "Name" in columns:
            temp["Name"] = entity.name
        elif "School Name" in columns:
            temp["School Name"] = entity.name
        elif "Company Name" in columns:
            temp["Company Name"] = entity.name
        elif "Department Name" in columns:
            temp["Department Name"] = entity.name
        elif "Social Sectors Name" in columns:
            temp["Social Sectors Name"] = entity.name
        elif "College Name" in columns:
            temp["College Name"] = entity.name
        if "Financial Assistance" in columns:
            temp["Financial Assistance"] = entity.financial_assistance
        if "Board" in columns:
            temp["Board"]=entity.school_board
        if "TI Board" in  columns:
            temp['TI Board']=entity.board
        if "Medium of Instruction" in columns:
            temp["Medium of Instruction"] = entity.medium_of_instruction
        if "Grade" in columns:
            temp["Grade"]=entity.grade
        if "Type" in columns:
            temp["Type"]=entity.type
        if "Affiliation" in columns:
            temp["Affiliation"]=entity.affiliation
        if "Faculty" in columns:
            temp["Faculty"]=entity.faculty
        if "UG/PG" in columns:
            temp["UG/PG"]=entity.ug_pg
        if "Place" in columns:
            temp["Place"] = entity.place
        if "Address" in columns:
            temp["Address"] = entity.address
        if "Country" in columns:
            temp["Country"] = entity.country.name
        if "State" in columns:
            temp["State"] = entity.state.name
        if "Region" in columns:
            temp["Region"] = entity.region.name
        if "District" in columns:
            temp["District"] = entity.district.name
        
        # Add LEFP details dynamically (TAN, PAN, GST, etc.)
        for lefp_row in entity.lefp:
                num_field = f"{lefp_row.portfolio.name} Number"
                name_field = f"{lefp_row.portfolio.name} Name"
                type_field = f"{lefp_row.portfolio.name} Type"
                temp[num_field] = lefp_row.number
                temp[name_field] = lefp_row.name
                temp[type_field] = lefp_row.type 
                
        entity_data.append(temp)
    if not entity_data:
        lefp_fields = []
        for item in portfolio_FP:
            lefp_fields.append(f"{item['name']} Number")
            lefp_fields.append(f"{item['name']} Name")
            lefp_fields.append(f"{item['name']} Type")
        all_columns = columns + lefp_fields
        entity_data.append({col: "" for col in all_columns})

        
    

    # Convert to DataFrame
    df = pd.DataFrame(entity_data)

    # Save to an Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name=portfolio.name)

        # Apply formatting
        workbook = writer.book
        worksheet = writer.sheets[portfolio.name]
        header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'align': 'center'})
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
            worksheet.set_column(col_num, col_num, 20)

    output.seek(0)
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename={portfolio.name}_Export_{datetime.now().strftime('%Y-%m-%d')}.xlsx"})





def get_columns_by_portfolio_sample(portfolio_name):
    portfolio_columns = {
        "Schools": ["Community","Society", "School Name","Financial Assistance", "Board", "Medium of Instruction", "Grade", "Place", "Address","Country", "State", "Region", "District"],
        "Companies": ["Community", "Company Name", "Place", "Address","Country", "State", "Region", "District"],
        "Departments": ["Community","Society",  "Department Name", "Place", "Address","Country", "State", "Region", "District"],
        "Social Sectors": ["Community","Society","Social Sectors Name", "Place", "Address","Country", "State", "Region", "District"],
        "Parishes": ["Diocese","Community","Society","Name", "Place", "Address","Country", "State", "Region", "District"],
        "Technical Institutions": ["Community","Society","Name", "Financial Assistance", "TI Board", "Type", "Place", "Address","Country", "State", "Region", "District"],
        "Colleges": ["Community","Society","College Name", "Financial Assistance", "Affiliation", "Faculty", "UG/PG","Place", "Address","Country", "State", "Region", "District", ],
        "Boarding and Hostel":[ "Community","Society", "Name","Type", "Place", "Address","Country", "State", "Region", "District"]

    }
    return portfolio_columns.get(portfolio_name, ['ID', 'Name'])

#Rough sample export base on the portfolio
@router.get("/entities/sample-export")
def get_sample_excel(portfolio_id: int, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Fetch portfolio name
    portfolio= db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        return {"error": "Invalid portfolio ID"}
    
    columns = get_columns_by_portfolio_sample(portfolio.name)

    if portfolio:
        portfolio_FP = list(map(
            lambda x: {"portfolio_id": x['portfolio_id'], "name": x['name']}, 
            mapped_financial(db, portfolio_id)[0]['financial_name']
        ))
    
    # Fetch financial portfolio (LEFP) details dynamically
    financial_data = []
    for fp in portfolio_FP:
        financial_data.append(f"{fp['name']} Number")
        financial_data.append(f"{fp['name']} Name")
        financial_data.append(f"{fp['name']} Type")
    
    columns.extend(financial_data)
    
    # Convert to DataFrame with only column headers
    df = pd.DataFrame(columns=columns)
    
    # Save to an Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name=portfolio.name)
        
        # Formatting the Excel Sheet
        workbook = writer.book
        worksheet = writer.sheets[portfolio.name]
        header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'align': 'center'})
        
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)  # Make header bold
            worksheet.set_column(col_num, col_num, 20)  # Adjust column width
    
    output.seek(0)
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={portfolio.name}_Sample_{datetime.now().strftime('%Y-%m-%d')}.xlsx"}
    )

@router.get("/list-by-financial")
def list_nonfinancial_by_financial(
    non_financial_portfolio_id: int,
    financial_portfolio_id: int,
    limit: int = 25,
    skip: int = 0,
    search: str = None,  # <-- Add search parameter
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        # Validate IDs
        if non_financial_portfolio_id <= 0 or financial_portfolio_id <= 0:
            return {"status": False, "details": "Portfolio IDs must be positive integers"}

        portfolio = db.query(Portfolio).filter(Portfolio.id == non_financial_portfolio_id).first()
        if not portfolio:
            return {"status": False, "details": "Invalid non-financial portfolio ID"}
        financial_portfolio = db.query(Portfolio).filter(Portfolio.id == financial_portfolio_id).first()
        if not financial_portfolio:
            return {"status": False, "details": "Invalid financial portfolio ID"}

        data = []

        def get_users(users, viewer_role):
            viewer_name = next((u.user.name for u in users if u.role_id != viewer_role), None)
            viewer_id = next((u.user.id for u in users if u.role_id != viewer_role), None)
            incharge_name = next((u.user.name for u in users if u.role_id == viewer_role), None)
            incharge_id = next((u.user.id for u in users if u.role_id == viewer_role), None)
            return viewer_name, incharge_name, viewer_id, incharge_id

        # Community
        if portfolio.id == 1:
            if curr_user.role_id == secret.s_admin_role:
                communities = db.query(Community)
            elif curr_user.role_id == secret.p_admin_role:
                communities = db.query(Community).filter(Community.province_id == curr_user.province_id)
            else:
                com_user = db.query(CommunityUser).filter(CommunityUser.user_id == curr_user.user_id).all()
                cpf_users = db.query(CFPUser).filter(
                    CFPUser.user_id == curr_user.user_id,
                    
                ).all()
                
                com_ids = list(set(cu.cfp.community_id for cu in cpf_users))
                com_ids.extend(set(cu.community_id for cu in com_user))

                
                if not com_user and not cpf_users:
                    return {"status": False, "details": "You are not assigned to any community"}
                communities = db.query(Community).filter(
                    Community.id.in_(com_ids),
                    Community.province_id == curr_user.province_id
                )
            if search:
                communities = communities.filter(Community.name.ilike(f"%{search}%"))
            communities = communities.all()

            for com in communities:
                cfps = db.query(CFP).filter(
                    CFP.community_id == com.id,
                    CFP.portfolio_id == financial_portfolio_id
                ).all()
                if not cfps:
                    continue
                for cfp in cfps:
                    cpf_users = db.query(CFPUser).filter(CFPUser.cfp_id == cfp.id).all()
                    viewer_name, incharge_name, viewer_id, incharge_id = get_users(cpf_users, secret.ddm_user_role)
                    if (not viewer_name and not incharge_name) and (curr_user.role_id != secret.s_admin_role and curr_user.role_id != secret.p_admin_role):
                        continue  # Skip if no viewer or incharge found
                    if curr_user.user_id != viewer_id and curr_user.user_id != incharge_id and curr_user.role_id != secret.s_admin_role and curr_user.role_id != secret.p_admin_role:
                        continue 
                    print(f"Viewer ID: {viewer_id}, Incharge ID: {incharge_id}")
                    data.append({
                        "entity_id": com.id,
                        "entity_name": com.name,
                        "non_financial_portfolio_id": non_financial_portfolio_id,
                        "financial_portfolio_id": financial_portfolio_id,
                        "financialPortfolio_record_id": cfp.id,
                        "financialPortfolio_record_name": cfp.name,
                        "financialPortfolio_record_number": cfp.number,
                        "financialPortfolio_record_type": cfp.type,
                        "viewer": {
                            "id": viewer_id,
                            "name": viewer_name
                        },
                        "incharge":{
                            "id": incharge_id,
                            "name": incharge_name
                        },
                    })

        # Society
        elif portfolio.id == 2:
            if curr_user.role_id == secret.s_admin_role:
                societies = db.query(Society)
            elif curr_user.role_id == secret.p_admin_role:
                societies = db.query(Society).filter(Society.province_id == curr_user.province_id)
            else:
                society_user = db.query(SocietyUser).filter(SocietyUser.user_id == curr_user.user_id).all()
                spf_users = db.query(SFPUser).filter(
                    SFPUser.user_id == curr_user.user_id,
                ).all()
                soc_ids = list(set(su.sfp.society_id for su in spf_users))
                soc_ids.extend(set(su.society_id for su in society_user))
                if not society_user and not spf_users:
                    return {"status": False, "details": "You are not assigned to any society"}
                societies = db.query(Society).filter(
                    Society.id.in_(soc_ids),
                    Society.province_id == curr_user.province_id
                )
            if search:
                societies = societies.filter(Society.name.ilike(f"%{search}%"))
            societies = societies.all()

            for soc in societies:
                sfps = db.query(SFP).filter(
                    SFP.society_id == soc.id,
                    SFP.portfolio_id == financial_portfolio_id
                ).all()
                if not sfps:
                    continue
                for sfp in sfps:
                    sfp_users = db.query(SFPUser).filter(SFPUser.sfp_id == sfp.id).all()
                    viewer_name, incharge_name, viewer_id, incharge_id = get_users(sfp_users, secret.ddm_user_role)
                    if (not viewer_name and not incharge_name) and (curr_user.role_id != secret.s_admin_role and curr_user.role_id != secret.p_admin_role):
                        continue
                    if curr_user.user_id != viewer_id and curr_user.user_id != incharge_id and curr_user.role_id != secret.s_admin_role and curr_user.role_id != secret.p_admin_role:
                        continue 
                    data.append({
                        "entity_id": soc.id,
                        "entity_name": soc.name,
                        "non_financial_portfolio_id": non_financial_portfolio_id,
                        "financial_portfolio_id": financial_portfolio_id,
                        "financialPortfolio_record_id": sfp.id,
                        "financialPortfolio_record_name": sfp.name,
                        "financialPortfolio_record_number": sfp.number,
                        "financialPortfolio_record_type": sfp.type,
                        "viewer": {
                            "id": viewer_id,
                            "name": viewer_name
                        },
                        "incharge":{
                            "id": incharge_id,
                            "name": incharge_name
                        },
                    })

        # Legal Entity
        else:
            if curr_user.role_id == secret.s_admin_role:
                legal_entities = db.query(LegalEntity).filter(
                    LegalEntity.portfolio_id == non_financial_portfolio_id
                )
            elif curr_user.role_id == secret.p_admin_role:
                legal_entities = db.query(LegalEntity).filter(
                    LegalEntity.province_id == curr_user.province_id,
                    LegalEntity.portfolio_id == non_financial_portfolio_id
                )
            else:
                legal_entity_user = db.query(LegalEntityUser).filter(
                    LegalEntityUser.user_id == curr_user.user_id,
                    LegalEntity.portfolio_id == non_financial_portfolio_id
                ).all()
                lefp_users = db.query(LEFPUser).filter(
                    LEFPUser.user_id == curr_user.user_id,
                ).all()

                legal_entity_ids = list(set(lefp.lefp.legal_entity_id for lefp in lefp_users))
                legal_entity_ids.extend(set(le.legal_entity_id for le in legal_entity_user))

                if not legal_entity_user and not lefp_users:
                    return {"status": False, "details": "You are not assigned to any legal entity"}
                legal_entities = db.query(LegalEntity).filter(
                    LegalEntity.id.in_(legal_entity_ids),
                    LegalEntity.portfolio_id == non_financial_portfolio_id,
                    LegalEntity.province_id == curr_user.province_id,
                        
                )
            if search:
                legal_entities = legal_entities.filter(LegalEntity.name.ilike(f"%{search}%"))
            legal_entities = legal_entities.all()

            for entity in legal_entities:
                lefps = db.query(LEFP).filter(
                    LEFP.legal_entity_id == entity.id,
                    LEFP.portfolio_id == financial_portfolio_id
                ).all()
                if not lefps:
                    continue
                for le in lefps:
                    lefp_users = db.query(LEFPUser).filter(LEFPUser.lefp_id == le.id).all()
                    viewer_name, incharge_name, viewer_id, incharge_id = get_users(lefp_users, secret.ddm_user_role)
                    if (not viewer_name and not incharge_name) and (curr_user.role_id != secret.s_admin_role and curr_user.role_id != secret.p_admin_role):
                        continue
                    if curr_user.user_id != viewer_id and curr_user.user_id != incharge_id and curr_user.role_id != secret.s_admin_role and curr_user.role_id != secret.p_admin_role:
                        continue 
                    data.append({
                        "entity_id": entity.id,
                        "entity_name": entity.name,
                        "non_financial_portfolio_id": non_financial_portfolio_id,
                        "financial_portfolio_id": financial_portfolio_id,
                        "financialPortfolio_record_id": le.id,
                        "financialPortfolio_record_name": le.name,
                        "financialPortfolio_record_number": le.number,
                        "financialPortfolio_record_type": le.type,
                        "viewer": {
                            "id": viewer_id,
                            "name": viewer_name
                        },
                        "incharge":{
                            "id": incharge_id,
                            "name": incharge_name
                        },
                    })

        total_count = len(data)
        if limit != 0:
            data = data[skip:skip+limit]
        return {
            "status": True,
            "details": "Data fetched successfully",
            "data": data,
            "total_count": total_count
        }
    except Exception as e:
        return {"status": False, "details": f"Error fetching data: {str(e)}"}
    

@router.put("/entity-portfolio/update")
def update_entity_portfolio(
    financial_record_id: int,
    data: EntityPortfolioUpdateSchema,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        # Map portfolio_id to their respective models and user models
        portfolio_map = {
            secret.community_id: {"model": CFP, "user_model": CFPUser, "user_field": "cfp_id"},
            secret.society_id: {"model": SFP, "user_model": SFPUser, "user_field": "sfp_id"},
        }
        default_model = {"model": LEFP, "user_model": LEFPUser, "user_field": "lefp_id"}

        mapping = portfolio_map.get(data.portfolio_id, default_model)
        model, user_model, user_field = mapping["model"], mapping["user_model"], mapping["user_field"]

        # Fetch the financial record
        record = db.query(model).filter(model.id == financial_record_id).first()
        if not record:
            return {"status": False, "details": f"{model.__name__} not found"}

        # Update only if value is provided
        if data.financial_number is not None:
            record.number = data.financial_number
        if data.financial_name is not None:
            record.name = data.financial_name
        if data.financial_type is not None:
            record.type = data.financial_type

        # Update users only if viewer or incharge provided
        if data.financial_viewer or data.financial_incharge:
            db.query(user_model).filter(getattr(user_model, user_field) == record.id).delete()
            
            for usr_id in [data.financial_viewer, data.financial_incharge]:
                if usr_id == 0:
                    continue
                if usr_id:
                    user = db.query(User).filter(User.id == usr_id).first()
                    if not user:
                        raise HTTPException(status_code=404, detail=f"User with ID {usr_id} not found")
                    db.add(user_model(
                        **{user_field: record.id},
                        user_id=user.id,
                        role_id=user.role_id,
                        created_by=curr_user.user_id
                    ))
        else:
            db.query(user_model).filter(getattr(user_model, user_field) == record.id).delete()
        db.commit()

        return {"status": True, "details": f"updated successfully"}

    except Exception as e:
        db.rollback()
        return {"status": False, "details": f"Error updating data: {str(e)}"}
