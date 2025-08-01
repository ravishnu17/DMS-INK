import json
from fastapi import APIRouter, Depends,HTTPException,Body,Query,Request,Form, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session,joinedload
from sqlalchemy import func,cast,String,or_
from settings.db import get_db
from jwt import ExpiredSignatureError, InvalidTokenError
from typing import List
from models.access_control import Country, State, District, Region, Province, Role, User, Module, Feature, ModuleFeature, RoleModuleFeature
from models.configuration import (CommunityUser,SocietyUser,Community, CommunityUser, Society, SocietyUser,LegalEntity,LegalEntityUser, 
        Portfolio, CFPUser, SFPUser, LEFPUser
    )
from schemas.access_control import ( CountrySchema, StateSchema, RegionSchema, DistrictSchema, ProvinceSchema, Token,RoleSchema,UserSchema, 
    ResponseModel, LocationResponseModel, AccessResponseModel, LoginResponse, UserOptionsSchema, 
    AccessResponseModel, RoleSchema,PermissionUser, ModuleSchema, FeatureSchema, ModuleFeatureSchema,ModuleFeatureResponse, RoleModuleFeatureSchema,
    RMFUpdateSchema,ForgotPasswordRequest,ResetPasswordRequest,AdminPassword,TokenSchema
)
from models.notification import Notification
from settings.auth import authenticate, verify_pwd, genToken, encrypt, authAdmin,decode_token,create_access_token,decode_jwt_token,verifyToken
from settings.config import secret
from constants.constant import limit_count, str_to_arr, get_new_code,authenticate_permission,send_email,authenticate_permission_user
from constants.mail_layout import forgot_password_html,update_pasword
from datetime import datetime,timedelta
from settings.auth import access_token_forgot_password,verify_action_token
from fastapi.responses import HTMLResponse
from typing import Optional
from uuid import uuid4
import os
from tempfile import SpooledTemporaryFile
from fastapi.responses import Response
from settings.config import secret
from pydantic import ValidationError
import os
import shutil
from uuid import uuid4
from typing import Optional
from fastapi import UploadFile
from constants.constant import root_path
from fastapi.responses import FileResponse
from settings.auth import verify_file_token,genToken
from schemas.answers import ResponseSchema



from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="access/login") 

loc_router= APIRouter(
    prefix="/location",
    tags=["Location"]
)
# List and filter Countries
@loc_router.get('/country', response_model=LocationResponseModel)
def list_countries(skip: int= 0, limit: int= limit_count,search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    proivince_country_id= db.query(Province).with_entities(Province.country_ids).filter(Province.id == curr_user.province_id).first()
    query= db.query(Country).order_by(Country.name.asc())
    if proivince_country_id:
        query= query.filter(Country.id.in_(str_to_arr(proivince_country_id.country_ids)))

    if search:
        query= query.filter(func.lower(Country.name).contains(search.lower()))
    
    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()

    return { "status": True,"details":"Countries fetched successfully","data": data, "total_count": total_count }

# Add list of countries
@loc_router.post('/country', response_model=LocationResponseModel)
def add_country(countries:List[CountrySchema], db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    country_data= [Country(**country.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id) for country in countries]
    db.add_all(country_data)
    db.commit()
    return { "status": True,"details":"Countries added successfully","data": country_data }

# edit country
@loc_router.put('/country/{id}')
def edit_country(id:int, country:CountrySchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    country_data= db.query(Country).filter(Country.id == id).first()
    if not country_data:
        return ResponseModel(status=False, details="Country not found")
    country_data.name= country.name
    country_data.updated_by= curr_user.user_id
    db.commit()
    return { "status": True,"details":"Country updated successfully" }

# delete country
@loc_router.delete('/country/{id}')
def delete_country(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    country_data= db.query(Country).filter(Country.id == id)
    if not country_data.first():
        return ResponseModel(status=False, details="Country not found")
    country_data.delete(synchronize_session= False)
    db.commit()
    return { "status": True,"details":"Country deleted successfully" }

# List and filter states
@loc_router.get('/state', response_model=LocationResponseModel)
def list_states(skip: int= 0, limit: int= limit_count,search: str= None, country_id: int= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    province_state_id= db.query(Province).with_entities(Province.state_ids).filter(Province.id == curr_user.province_id).first()
    query= db.query(State).order_by(State.name.asc())

    if province_state_id:
        query= query.filter(State.id.in_(str_to_arr(province_state_id.state_ids)))
    
    if country_id:
        query= query.filter(State.country_id == country_id)
    if search:
       query= query.filter(func.lower(State.name).contains(search.lower()))
    
    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()

    return { "status": True,"details":"States fetched successfully","data": data, "total_count": total_count }

# Add list of states
@loc_router.post('/state/{country_id}', response_model=LocationResponseModel)
def add_state(states:List[StateSchema], db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    state_data= [State(**state.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id) for state in states]
    db.add_all(state_data)
    db.commit()
    return { "status": True,"details":"States added successfully","data": state_data }

# edit state
@loc_router.put('/state/{id}')
def edit_state(id:int, state:StateSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    state_data= db.query(State).filter(State.id == id).first()
    if not state_data:
        return ResponseModel(status=False, details="State not found")
    state_data.name= state.name
    state_data.country_id= state.country_id
    state_data.updated_by= curr_user.user_id
    db.commit()
    return { "status": True,"details":"State updated successfully" }

# delete state
@loc_router.delete('/state/{id}')
def delete_state(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    state_data= db.query(State).filter(State.id == id)
    if not state_data.first():
        return ResponseModel(status=False, details="State not found")
    state_data.delete(synchronize_session= False)
    db.commit()
    return { "status": True,"details":"State deleted successfully" }

# List and filter regions
@loc_router.get('/region', response_model=LocationResponseModel)
def list_regions(skip: int= 0, limit: int= limit_count,search: str= None, state_id: int= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    province_region_id= db.query(Province).with_entities(Province.region_ids).filter(Province.id == curr_user.province_id).first()

    query= db.query(Region).order_by(Region.name.asc())

    if province_region_id:
        query= query.filter(Region.id.in_(str_to_arr(province_region_id.region_ids)))    
    # if state_id:
    #     query= query.filter(Region.state_id == state_id)
    if search:
       query= query.filter(func.lower(Region.name).contains(search.lower()))

    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()

    return { "status": True,"details":"Regions fetched successfully","data": data, "total_count": total_count }

# Add list of regions
@loc_router.post('/region', response_model=LocationResponseModel)
def add_region(regions:List[RegionSchema], db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    region_data= [Region(**region.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id) for region in regions]
    db.add_all(region_data)
    db.commit()
    return { "status": True,"details":"Regions added successfully","data": region_data }

# edit region
@loc_router.put('/region/{id}')
def edit_region(id:int, region:RegionSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    region_data= db.query(Region).filter(Region.id == id).first()
    if not region_data:
        return ResponseModel(status=False, details="Region not found")
    region_data.name= region.name
    region_data.state_id= region.state_id
    region_data.updated_by= curr_user.user_id
    db.commit()
    return { "status": True,"details":"Region updated successfully" }

# delete region
@loc_router.delete('/region/{id}')
def delete_region(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    region_data= db.query(Region).filter(Region.id == id)
    if not region_data.first():
        return ResponseModel(status=False, details="Region not found")
    region_data.delete(synchronize_session= False)
    db.commit()
    return { "status": True,"details":"Region deleted successfully" }

# List and filter districts
@loc_router.get('/district', response_model=LocationResponseModel)
def list_districts(skip: int= 0, limit: int= limit_count,search: str= None, region_id: int= None,state_id: int= None ,db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    province_district_id= db.query(Province).with_entities(Province.district_ids).filter(Province.id == curr_user.province_id).first()
    query= db.query(District).order_by(District.name.asc())

    if province_district_id:
        query= query.filter(District.id.in_(str_to_arr(province_district_id.district_ids)))
    if region_id:
        query= query.filter(District.region_id == region_id)
    if state_id:
        query= query.filter(District.state_id == state_id)   
    if search:
       query= query.filter(func.lower(District.name).contains(search.lower()))

    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()

    return { "status": True,"details":"Districts fetched successfully","data": data, "total_count": total_count }

# Add list of districts
@loc_router.post('/district', response_model=LocationResponseModel)
def add_district(districts:List[DistrictSchema], db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    district_data= [District(**district.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id) for district in districts]
    for district in district_data:
        
        db.add(district)
        db.commit()
    return { "status": True,"details":"Districts added successfully","data": district_data }

# edit district
@loc_router.put('/district/{id}')
def edit_district(id:int, district:DistrictSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    district_data= db.query(District).filter(District.id == id).first()
    if not district_data:
        return ResponseModel(status=False, details="District not found")
    district_data.name= district.name
    district_data.region_id= district.region_id
    district_data.state_id= district.state_id
    district_data.updated_by= curr_user.user_id
    db.commit()
    return { "status": True,"details":"District updated successfully" }

# delete district
@loc_router.delete('/district/{id}')
def delete_district(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    district_data= db.query(District).filter(District.id == id)
    if not district_data.first():
        return ResponseModel(status=False, details="District not found")
    district_data.delete(synchronize_session= False)
    db.commit()
    return { "status": True,"details":"District deleted successfully" }


access_router= APIRouter(
    prefix="/access",
    tags=["Access Control"],
)

# list and filter provinces
@access_router.get('/provinces', response_model=AccessResponseModel)
def list_province(skip: int= 0, limit: int= limit_count,search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    query= db.query(Province).order_by(Province.id.desc())
    if search:
        query= query.filter(func.lower(Province.code).contains(search.lower()) | 
                func.lower(Province.name).contains(search.lower()) |
                func.lower(Province.place).contains(search.lower()) |
                func.lower(Province.address).contains(search.lower()) |
                Province.country_id.in_(
                db.query(Country.id).filter(func.lower(Country.name).contains(search.lower())).scalar_subquery()
                ) |
                Province.state_id.in_(
                    db.query(State.id).filter(func.lower(State.name).contains(search.lower())).scalar_subquery()
                ) |
                Province.region_id.in_(
                    db.query(Region.id).filter(func.lower(Region.name).contains(search.lower())).scalar_subquery()
                ) |
                Province.district_id.in_(
                    db.query(District.id).filter(func.lower(District.name).contains(search.lower())).scalar_subquery()
                )
            )

    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()

    return { "status": True,"details":"Provinces fetched successfully","data": data, "total_count": total_count }

# get province by id
@access_router.get('/province/{id}', response_model=AccessResponseModel)
def get_province(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    province_data= db.query(Province).filter(Province.id == id).first()
    if not province_data:
        return ResponseModel(status=False, details="Province not found")
    province_data.countries= db.query(Country).filter(Country.id.in_(province_data.country_ids.split(','))).all()
    province_data.states= db.query(State).filter(State.id.in_(province_data.state_ids.split(','))).all()
    province_data.regions= db.query(Region).filter(Region.id.in_(province_data.region_ids.split(','))).all()
    province_data.districts= db.query(District).filter(District.id.in_(province_data.district_ids.split(','))).all()
    return { "status": True,"details":"Province fetched successfully","data": province_data }

# add new province
@access_router.post('/province')
def add_province(province:ProvinceSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    province.code= get_new_code(db, Province, "PRO")

    db_country_ids= set(i[0] for i in db.query(Country.id).all())
    db_state= db.query(State).all()
    db_region= db.query(Region).all()
    db_district= db.query(District).all()

    valid_state_ids, valid_region_ids, valid_district_ids= set(), set(), set()
    state_country_map, region_state_map, district_region_map= dict(), dict(), dict()

    for i in db_state:
        valid_state_ids.add(i.id)
        state_country_map[i.id]= i.country_id
    for i in db_region:
        valid_region_ids.add(i.id)
        region_state_map[i.id]= i.state_id
    for i in db_district:
        valid_district_ids.add(i.id)
        district_region_map[i.id]= i.region_id
    # validate location
    if not province.country_id in db_country_ids:
        return ResponseModel(status=False, details="Country not found")
    if not  province.state_id in valid_state_ids:
        return ResponseModel(status=False, details="State not found")
    else:
        if not  state_country_map[province.state_id] == province.country_id:
            return ResponseModel(status=False, details="Invalid state ID")
    if not  province.region_id in valid_region_ids:
        return ResponseModel(status=False, details="Region not found")
    else:
        if not  region_state_map[province.region_id] == province.state_id:
            return ResponseModel(status=False, details="Invalid region ID")
    if not  province.district_id in valid_district_ids:
        return ResponseModel(status=False, details="District not found")
    else:
        if not  district_region_map[province.district_id] == province.region_id:
            return ResponseModel(status=False, details="Invalid district ID")
    
    # validate location ids
    province.country_ids= set(province.country_ids)
    if not province.country_ids.issubset(db_country_ids):
        return ResponseModel(status=False, details="Invalid country ids")

    province.state_ids= set(province.state_ids)
    for state_id in province.state_ids:
        if state_id not in valid_state_ids:
            return ResponseModel(status=False, details="Invalid state ids")
        if state_country_map[state_id] not in province.country_ids:
            return ResponseModel(status=False, details="Invalid state ids")

    province.region_ids= set(province.region_ids)
    for region_id in province.region_ids:
        if region_id not in valid_region_ids:
            return ResponseModel(status=False, details="Invalid region ids")
        if region_state_map[region_id] not in province.state_ids:
            return ResponseModel(status=False, details="Invalid region ids")

    province.district_ids= set(province.district_ids)
    for district_id in province.district_ids:
        if district_id not in valid_district_ids:
            return ResponseModel(status=False, details="Invalid district ids")
        if district_region_map[district_id] not in province.region_ids:
            return ResponseModel(status=False, details="Invalid district ids")
    

    province.country_ids= (',').join(map(str, province.country_ids))
    province.state_ids= (',').join(str(id) for id in province.state_ids)
    province.region_ids= (',').join(str(id) for id in province.region_ids)
    province.district_ids= (',').join(str(id) for id in province.district_ids)

    province_data= Province(**province.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id)
    db.add(province_data)
    db.commit()
    db.refresh(province_data)
    return { "status": True,"details":"Province added successfully","data": "province_data" }

# edit province
@access_router.put('/province/{id}')
def edit_province(id:int, province:ProvinceSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    province_data= db.query(Province).filter(Province.id == id)
    if not province_data.first():
        return ResponseModel(status=False, details="Province not found")
    province.country_ids= (',').join(str(id) for id in province.country_ids)
    province.state_ids= (',').join(str(id) for id in province.state_ids)
    province.region_ids= (',').join(str(id) for id in province.region_ids)
    province.district_ids= (',').join(str(id) for id in province.district_ids)
    province_data.update({**province.model_dump(), "updated_by": curr_user.user_id}, synchronize_session= False)
    db.commit()
    return { "status": True,"details":"Province updated successfully" }

# delete province
@access_router.delete('/province/{id}')
def delete_province(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    province_data= db.query(Province).filter(Province.id == id)
    if not province_data.first():
        return ResponseModel(status=False, details="Province not found")
    province_data.delete(synchronize_session= False)
    db.commit()
    return { "status": True,"details":"Province deleted successfully" }

# login
@access_router.post('/login', response_model=LoginResponse)
def login(user: OAuth2PasswordRequestForm= Depends(), db:Session= Depends(get_db)):
    user_data= db.query(User).filter(User.username == user.username).first()
    if not user_data:
        return { "status": False,"details":"Invalid username or password" }
    if not verify_pwd(user.password.strip(), user_data.password.strip()):
        return { "status": False,"details":"Invalid username or password" }
    if user_data.province_id is None and user_data.role_id != secret.s_admin_role:
        return { "status": False,"details":"Please contact your admin to update province" }
    if user_data.resign:
        return { "status": False,"details":"Your account marked as resigned, please contact your admin" }
    if not user_data.active:
        return { "status": False,"details":"Your account is inactive, please contact your admin" }
    token= genToken({"role_id": user_data.role_id, "user_id": user_data.id, "province_id": 0 if user_data.role_id == secret.s_admin_role else user_data.province_id, "username": user_data.username, "active": user_data.active})
    
    return { "status": True,"details":"Login successful","access_token": token, "token_type": "bearer", "user": user_data }

# add role
@access_router.post('/roles')
def add_role(role:List[RoleSchema], db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    for role_data in role:
        role_new= Role(**role_data.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id)
        if db.query(Role).filter(Role.name == role_data.name).all():
            return {"status": False, "details": "Role already exists"}
        db.add(role_new)
        db.commit()
        db.refresh(role_new)

        module_features= db.query(ModuleFeature).all()
        try:
            for module_feature in module_features:
                db.add(RoleModuleFeature(role_id= role_new.id, module_feature_id= module_feature.id, status= False , created_by= curr_user.user_id, updated_by= curr_user.user_id))
                db.commit()
        except Exception as e:
            db.query(Role).filter(Role.id == role_new.id).delete(synchronize_session= False)
            return {"status": False, "details": str(e)}
    return { "status": True,"details":"Role added successfully","data": role }

# list and Filter role
@access_router.get('/roles')
def list_roles(skip: int= 0, limit: int= limit_count,search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query = db.query(Role).order_by(Role.id.asc()).filter(Role.id != secret.s_admin_role)

    if search:
        query= query.filter(func.lower(Role.name).contains(search.lower()))

    total_count= query.count()

    if limit !=0:
        query= query.offset(skip).limit(limit)
    data = query.all()

    return { "status": True,"details":"Roles fetched successfully","data": data, "total_count": total_count }

# update role
@access_router.put('/roles/{role_id}')
def update_role(role_id:int, role:RoleSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    role_data= db.query(Role).filter(Role.id == role_id).first()
    if not role_data:
        return {"status": False, "details": "Role not found"}
    if db.query(Role).filter(Role.name == role.name, Role.id != role_id).first():
        return {"status": False, "details": "Role already exists"}
    
    role_data.name= role.name
    role_data.updated_by= curr_user.user_id
    db.commit()
    db.refresh(role_data)
    return { "status": True,"details":"Role updated successfully","data": role_data }

# delete role
@access_router.delete('/roles/{role_id}')
def delete_role(role_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):

    role_data= db.query(Role).filter(Role.id == role_id)
    if not role_data.first():
        return {"status": False, "details": "Role not found"}
    
    role_data.delete()
    db.commit()
    return { "status": True,"details":"Role deleted successfully" }

# module
@access_router.get('/modules')
def list_modules(skip: int= 0, limit: int= limit_count,search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query = db.query(Module).order_by(Module.id.desc())
    if search:
        query= query.filter(func.lower(Module.name).contains(search.lower()))

    total_count= query.count()

    if limit !=0:
        query= query.offset(skip).limit(limit)
    data = query.all()

    return { "status": True,"details":"Modules fetched successfully","data": data, "total_count": total_count }

@access_router.post('/modules')
def add_module(module:List[ModuleSchema], db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    modules= []
    for i in module:
        if db.query(Module).filter(Module.name == i.name).first():
            return {"status": False, "details": f"Module name {i.name} already exists"}
        new_data= Module(name=i.name, created_by= curr_user.user_id, updated_by= curr_user.user_id)
        db.add(new_data)
        db.commit()
        db.refresh(new_data)
        modules.append(new_data)
    return { "status": True,"details":"Modules added successfully","data": modules }

@access_router.put('/modules/{id}')
def update_module(id:int, module: ModuleSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    if db.query(Module).filter(Module.name == module.name, Module.id != id).first():
        return ResponseModel(status=False, details="Module name already exists")
    module_data= db.query(Module).filter(Module.id == id).first()
    if not module_data:
        return ResponseModel(status=False, details="Module not found")
    module_data.name= module.name
    module_data.updated_by= curr_user.user_id
    db.commit()
    return ResponseModel(status=True, details="Module updated successfully")

@access_router.delete('/modules/{id}')
def delete_module(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    module_data= db.query(Module).filter(Module.id == id)
    if not module_data.first():
        return ResponseModel(status=False, details="Module not found")
    module_data.delete(synchronize_session= False)
    db.commit()
    return ResponseModel(status=True, details="Module deleted successfully")

# list features
@access_router.get('/features')
def list_features(skip: int= 0, limit: int= limit_count,search: str= None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query = db.query(Feature).order_by(Feature.id.desc())
    if search:
        query= query.filter(func.lower(Feature.name).contains(search.lower()))

    total_count= query.count()

    if limit !=0:
        query= query.offset(skip).limit(limit)
    data = query.all()

    return { "status": True,"details":"Features fetched successfully","data": data, "total_count": total_count }

@access_router.post('/features')
def add_feature(feature:List[FeatureSchema], db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    for i in feature:
        if db.query(Feature).filter(Feature.name == i.name).first():
            return {"status": False, "details": f"Feature name {i.name} already exists"}
        feature_temp= Feature(name= i.name, created_by= curr_user.user_id, updated_by= curr_user.user_id)
        db.add(feature_temp)
        db.commit()
        db.refresh(feature_temp)
    
        # add module features
        db.add_all([ModuleFeature(module_id= m_id, feature_id= feature_temp.id, created_by= curr_user.user_id, updated_by= curr_user.user_id) for m_id in i.module_ids])
        db.commit()
    return ResponseModel(status=True, details="Feature added successfully")

@access_router.put('/features/{id}')
def update_feature(id:int, feature: FeatureSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    if db.query(Feature).filter(Feature.name == feature.name, Feature.id != id).first():
        return ResponseModel(status=False, details="Feature name already exists")
    feature_data= db.query(Feature).filter(Feature.id == id).first()
    if not feature_data:
        return ResponseModel(status=False, details="Feature not found")
    feature_data.name= feature.name
    feature_data.updated_by= curr_user.user_id
    db.commit()
    return ResponseModel(status=True, details="Feature updated successfully")

@access_router.delete('/features/{id}')
def delete_feature(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    feature_data= db.query(Feature).filter(Feature.id == id)
    if not feature_data.first():
        return ResponseModel(status=False, details="Feature not found")
    feature_data.delete(synchronize_session= False)
    db.commit()
    return ResponseModel(status=True, details="Feature deleted successfully")

# list module features
@access_router.get('/module-features', response_model= ModuleFeatureResponse)
def list_module_features(skip: int= 0, limit: int= limit_count, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query = db.query(ModuleFeature).order_by(ModuleFeature.id.asc())

    total_count= query.count()

    if limit !=0:
        query= query.offset(skip).limit(limit)
    data = query.all()
    return { "status": True,"details":"Module features fetched successfully","data": data, "total_count": total_count }

# add module feature
@access_router.post('/module-features')
def add_module_feature(module_feature:List[ModuleFeatureSchema], db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    for module in module_feature:
        for feature_id in module.feature_id:
            if db.query(ModuleFeature).filter(ModuleFeature.module_id == module.module_id, ModuleFeature.feature_id == feature_id).first():
                continue
            module_feature_temp= ModuleFeature(module_id= module.module_id, feature_id= feature_id, created_by= curr_user.user_id, updated_by= curr_user.user_id)
            db.add(module_feature_temp)
            db.commit()
    return ResponseModel(status=True, details="Module feature added successfully")


# delete module feature
@access_router.delete('/module-features/{id}')
def delete_module_feature(id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    module_feature_data= db.query(ModuleFeature).filter(ModuleFeature.id == id)
    if not module_feature_data.first():
        return ResponseModel(status=False, details="Module feature not found")
    module_feature_data.delete(synchronize_session= False)
    db.commit()
    return ResponseModel(status=True, details="Module feature deleted successfully")

# add role module feature
@access_router.post('/role-module-features')
def add_role_module_feature(db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    roles= db.query(Role.id).all()
    if not roles:
        return ResponseModel(status=False, details="Roles not found")
    module_features= db.query(ModuleFeature).all()
    for role in roles:
        for module_feature in module_features:
            if db.query(RoleModuleFeature).filter(RoleModuleFeature.role_id == role.id, RoleModuleFeature.module_feature_id == module_feature.id).first():
                continue
            db.add(RoleModuleFeature(role_id= role.id, module_feature_id= module_feature.id, status= True if role.id in [secret.s_admin_role, secret.p_admin_role] else False , created_by= curr_user.user_id, updated_by= curr_user.user_id))
            db.commit()
    return ResponseModel(status=True, details="Role module feature added successfully")

# get module feature by role
@access_router.get('/role-module-features')
def get_role_module_feature(role_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    role_data= db.query(Role).filter(Role.id == role_id).first()
    if not role_data:
        return ResponseModel(status=False, details="Role not found")
    data= db.query(RoleModuleFeature).filter(RoleModuleFeature.role_id == role_id).order_by(RoleModuleFeature.id.asc()).all()
    if not data:
        return ResponseModel(status=False, details="Role module feature not found")
    model= {
        'role_id': role_data.id,
        'role_name': role_data.name,
        'permission' : []
    }
    for module_feature in data:
        if len(model['permission']) == 0:
            model['permission'].append({
                'module_id': module_feature.module_feature.module_id,
                'module_name': module_feature.module_feature.module.name,
                'features': [{
                    'id': module_feature.id,
                    'feature_id': module_feature.module_feature.feature_id,
                    'feature_name': module_feature.module_feature.feature.name,
                    'status': module_feature.status
                }]
            })
        else:
            try:
                index= list(map(lambda x: x['module_id'], model['permission'])).index(module_feature.module_feature.module_id)
                model['permission'][index]['features'].append({
                        'id': module_feature.id,
                        'feature_id': module_feature.module_feature.feature_id,
                        'feature_name': module_feature.module_feature.feature.name,
                        'status': module_feature.status
                    })
            except:
                    model['permission'].append({
                        'module_id': module_feature.module_feature.module_id,
                        'module_name': module_feature.module_feature.module.name,
                        'features': [{
                            'id': module_feature.id,
                            'feature_id': module_feature.module_feature.feature_id,
                            'feature_name': module_feature.module_feature.feature.name,
                            'status': module_feature.status
                        }]
                    })
    return {"status": True, "details": "Role module feature fetched successfully", "data": model}

# update status role modle feature by id
@access_router.put('/role-module-features/{id}')
def update_role_module_feature(id:int, status:bool, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    role_module_feature_data= db.query(RoleModuleFeature).filter(RoleModuleFeature.id == id).first()
    if not role_module_feature_data:
        return ResponseModel(status=False, details="Role module feature not found")
    if role_module_feature_data.role_id == secret.s_admin_role and curr_user.role_id != secret.s_admin_role:
        return ResponseModel(status=False, details="You don't have permission to update this role module feature")

    role_module_feature_data.status= status
    role_module_feature_data.updated_by= curr_user.user_id
    db.commit()
    return ResponseModel(status=True, details="Role module feature updated successfully")

# bluk update of role module feature status
@access_router.put('/role-module-features')
def bulk_update_role_module_feature(data:List[RMFUpdateSchema], db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    for i in data:
        find= db.query(RoleModuleFeature).filter(RoleModuleFeature.id == i.id).first()
        if not find or find.role_id == secret.s_admin_role:
            return ResponseModel(status=False, details="Role module feature not found")
        if find.role_id == secret.s_admin_role and curr_user.role_id != secret.s_admin_role:
            return ResponseModel(status=False, details="You don't have permission to update this role module feature")
        find.status= i.status
        find.updated_by= curr_user.user_id
    db.commit()
    return ResponseModel(status=True, details="Role module feature updated successfully")

#post user
@access_router.post('/users', response_model=AccessResponseModel)
def create_user(user:UserSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    if curr_user.role_id != secret.s_admin_role:
        user.province_id = curr_user.province_id

    if db.query(User).filter(User.username == user.username).first():
        return ResponseModel(status=False, details="User with this username already exists")
    if db.query(User).filter(User.email == user.email).first():
        return ResponseModel(status=False, details="User with this email already exists")
    # Define default password since it's not in the schema
    default_password = "admin"
    encrypted_password = encrypt(default_password)
    new_user= User( **user.model_dump(),password=encrypted_password, created_by=curr_user.user_id, updated_by=curr_user.user_id)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    expire_minutes = 10
    token = access_token_forgot_password({"sub": user.email}, expires_delta=timedelta(minutes=expire_minutes))
    reset_link = f"{secret.website_url}{token}"
    send_email(email=user.email ,subject="Update Your Password",html_content=update_pasword(user.name,reset_link,expire_minutes))  


    return {"status": True, "details": "Registered successfully, please verify your email to setup password!", "data": new_user}

# get all users
@access_router.get('/users', response_model=AccessResponseModel)
def get_users(status: bool = None, skip: int = 0, limit: int = limit_count, search: str = None, role_id: int = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    query = db.query(User).filter(User.role_id != secret.s_admin_role).order_by(User.name.asc())
    if curr_user.province_id:
        query = query.filter(User.province_id == curr_user.province_id)
    if role_id:
        query = query.filter(User.role_id == role_id)
      
    if search:
        query = query.filter(
            or_(
                func.lower(User.name).contains(search.lower()),
                User.email.contains(search.lower()),
                cast(User.mobile_no, String).contains(search)
            )
        )
    
    if status is not None:
        query = query.filter(User.active == status)

    total_count = query.count()
    if limit != 0:
        data = query.offset(skip).limit(limit).all()
    else:
        data = query.all()
    return {"status": True, "details": "Users fetched successfully", "data": data, "total_count": total_count}

# get user by id
@access_router.get('/users/{user_id}', response_model=AccessResponseModel)
def get_user(user_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    data= db.query(User).filter(User.id == user_id).first()
    if not data:
        return ResponseModel(status=False, details="User not found")
    return {"status": True, "details": "User fetched successfully", "data": data}

# get all user for options
@access_router.get('/users-options', response_model=UserOptionsSchema)
def get_user_options(
    role_id: int = None,
    ddm: bool = False,
    skip: int = 0,
    limit: int = None,
    search: str = None,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    query = db.query(User).filter(
        User.role_id != secret.s_admin_role,
        User.resign == False,
        User.active == True
    )

    if curr_user.role_id != secret.s_admin_role:
        query = query.filter(User.province_id == curr_user.province_id)

    if role_id:
        query = query.filter(User.role_id == role_id)

    if search:
        query = query.filter(
            func.lower(User.name).contains(search.lower()) | 
            func.lower(User.email).contains(search.lower()) | 
            cast(User.mobile_no, String).contains(search) | 
            cast(User.whatsapp_no, String).contains(search)
        )

    total_count = query.count()
    user_list = query.order_by(User.name.asc()).offset(skip).limit(limit) if limit else query.order_by(User.name.asc())

    # Final data to return
    result = []

    for user in user_list:
        # Default name is just the user's name
        final_name = user.name

        # If ddm condition applies
        if ddm and role_id == secret.ddm_user_role:
            community_user = db.query(CommunityUser).filter(CommunityUser.user_id == user.id).first()
            if community_user:
                community = db.query(Community).filter(Community.id == community_user.community_id).first()
                if community:
                    final_name = f"{user.name} ({community.name})"

        result.append({
            "id": user.id,
            "name": final_name,
            "email": user.email,
            "province_id": user.province_id,
            "mobile_no": user.mobile_no,
            "mobile_country_code": user.mobile_country_code,
            "whatsapp_no": user.whatsapp_no,
            "whatsapp_country_code": user.whatsapp_country_code
        })

    return {
        "status": True,
        "details": "Users fetched successfully",
        "total_count": total_count,
        "data": result
    }

# update user
@access_router.put('/users/{user_id}', response_model=AccessResponseModel)
def update_user(user_id:int, user:UserSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    user_data= db.query(User).filter(User.id == user_id)
    if not user_data.first():
        return ResponseModel(status=False, details="User not found")
    del user.province_id
    
    for key, value in user.model_dump().items():
        setattr(user_data.first(), key, value)
    user_data.first().updated_by = curr_user.user_id
    db.commit()
    return { "status": True,"details":"User updated successfully" }

@access_router.get('/users/update-status/{user_id}')
def update_user_status(user_id: int, status: bool, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    user_data = db.query(User).filter(User.id == user_id).first()
    if not user_data:
        return {"status": False, "details": "User not found"}
    user_data.active = status
    user_data.updated_by = curr_user.user_id
    db.commit()
    return {"status": True, "details": "User status updated successfully"}

# delete user
@access_router.delete('/users/{user_id}')
def delete_user(user_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    user_data= db.query(User).filter(User.id == user_id)
    if not user_data.first():
        return {"status": False, "details": "User not found"}
    db.delete(user_data.first())
    db.commit()
    return { "status": True,"details":"User deleted successfully" }

# change password
@access_router.post('/change-password')
def change_password(user_id: int, old_password: str, new_password: str, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    user_data = db.query(User).filter(User.id == user_id).first()
    if not user_data:
        return {"status": False, "details": "User not found"}

    if not verify_pwd(old_password, user_data.password):
        return {"status": False, "details": "Old password is incorrect"}

    user_data.password = encrypt(new_password)
    user_data.updated_by = curr_user.user_id
    db.commit()
    db.refresh(user_data)

    return {"status": True, "details": "Password updated successfully"}

#forget-password
@access_router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        return {"status": False, "details": "User not found"}
    
    if user.resign:
        return {"status": False, "details": "Your account is marked as resigned, please contact your admin"}
    
    expire_minutes = 10
    token = access_token_forgot_password({"sub": user.email}, expires_delta=timedelta(minutes=expire_minutes))
    reset_link = f"{secret.website_url}{token}"

    # Sending the reset password email to the user
    send_email(email=data.email, subject="Reset Your Password", html_content=forgot_password_html(user.name, reset_link, expire_minutes))
    
    # Create a notification for the user
    notification = Notification(
        user_id=user.id,
        title="Reset Password",
        message="You have requested a password reset. Please check your email to proceed with the reset.",
        is_read=False  # Initially, the user hasn't read it yet
    )
    db.add(notification)
    db.commit()

    return {"status": True, "details": f"Reset link has been sent to your email {user.email}. Token expires in 10 minutes."}


#reset passwrod 
@access_router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        decoded_data = decode_token(payload.token)
        email = decoded_data.get("sub")
    except ExpiredSignatureError:
        return {"status": False, "details": "Token has expired. Please request a new password reset."}
    except InvalidTokenError:
        return {"status": False, "details": "Invalid token."}

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"status": False, "details": "User not found"}

    if payload.new_password != payload.confirm_password:
        return {"status": False, "details": "Passwords do not match"}

    user.password = encrypt(payload.new_password)

    # Add password reset notification
    db.add(Notification(
        user_id=user.id,
        title="Password Reset",
        message="Your password has been reset successfully."
    ))

    db.commit()

    return {"status": True, "details": "Password has been updated successfully"}


#link expired responese
@access_router.get("/link-expired") 
def confirm(token: str):
    user_id = verify_action_token(token, max_age=600)  # 600 seconds = 10 minutes
    
    if not user_id:
        return {"status": False, "details": "This link has expired or is invalid. Please request a new link."}
    
    return {"status": True, "details": f"Action confirmed for user ID {user_id}"}


#SuperAdmin Change the Password to the User
@access_router.post("/admin-changepassword")
async def admin_changepassword(payload:AdminPassword,db:Session=Depends(get_db),curr_user:Token=Depends(authenticate)):
    if curr_user.role_id not in [secret.p_admin_role, secret.s_admin_role]:
        return{"status":False,"details":"Unauthorized login"}

    user=db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        return {"status": False, "details": "User not found"}

    user.password=encrypt(payload.password)
    db.commit()
    
    return{"status":True,"details":"User password updated successfully"}

# reassign user
@access_router.put('/reassign-user')
def reassign_user(user_id: int, new_user_id: int, reason: str, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    user_data = db.query(User).filter(User.id == user_id).first()
    if not user_data:
        return {"status": False, "details": "User not found"}

    new_user_data = db.query(User).filter(User.id == new_user_id).first()
    if not new_user_data:
        return {"status": False, "details": "New user not found"}

    user_data.resign= True
    user_data.resign_reason = reason
    user_data.updated_by = curr_user.user_id
    db.commit()
    
    # update user rights
    for i in [CommunityUser, SocietyUser, LegalEntityUser, CFPUser, SFPUser, LEFPUser]:
        db.query(i).filter(i.user_id == user_data.id).update({"user_id": new_user_data.id}, synchronize_session= False)

    db.commit()

    return {"status": True, "details": "User reassigned successfully"}

#Passing the ID's and geting the Permissions
@access_router.get('/current-user', response_model=PermissionUser)
def get_current_user(db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    token = genToken({"user_id": curr_user.user_id})
    
    user_data = db.query(User).options(joinedload(User.role)).filter(User.id == curr_user.user_id).first()
    if not user_data:
        raise ResponseModel(status=False, details="User not found")

    # Manually override profile_pic URL to include base URL + token
    if user_data.profile_pic:
        user_data.profile_pic = f"{secret.profile_base_url}{token}"

    check_admin = curr_user.role_id in [secret.s_admin_role, secret.p_admin_role]
    community = authenticate_permission(curr_user, db, db.query(Community), Community, "community").first()
    society = authenticate_permission(curr_user, db, db.query(Society), Society, "society").first()
    legal_entities = (
        db.query(LegalEntity.portfolio_id)
        .join(LegalEntityUser)
        .filter(LegalEntityUser.user_id == curr_user.user_id)
        .group_by(LegalEntity.portfolio_id)
        .all()
    )
    portfolios = db.query(Portfolio.id, Portfolio.name).filter(Portfolio.type == 'Non Financial').all()

    # module feature permissions
    role_module_features = db.query(RoleModuleFeature).filter(RoleModuleFeature.role_id == curr_user.role_id).all()
    role_permissions = {}
    for i in role_module_features:
        mod_name = i.module_feature.module.name.lower()
        feat_name = i.module_feature.feature.name.lower()
        if mod_name not in role_permissions:
            role_permissions[mod_name] = {feat_name: i.status}
        else:
            role_permissions[mod_name][feat_name] = i.status

    # user base permissions
    permissions = {
        **{
            portfolio.name.lower(): True if check_admin else bool(
                [i for i in legal_entities if i.portfolio_id == portfolio.id]
            )
            for portfolio in portfolios
        },
        "community": True if check_admin else bool(community),
        "society": True if check_admin else bool(society),
        "role_permissions": role_permissions,
        'dashboard': True
    }
    
    return {
        "status": True,
        "details": "User fetched successfully",
        "data": user_data,
        "permissions": permissions
    }


#Creat token without password that token only generated my superadmin
@access_router.post("/simulate-login", response_model=LoginResponse)
def simulate_login(username_or_email: str, db: Session = Depends(get_db), curr_user: User = Depends(authenticate)):
    if curr_user.role_id != 1:  # Assume 1 = Superadmin
        return {"status": False, "details": "Only Superadmin can simulate login."}

    user = db.query(User).filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()

    if not user:
        return {"status": False, "details": "Target user not found."}
    
    if user.role_id == 1:
        return {"status": False, "details": "Cannot simulate another Superadmin."}

    token = genToken({
        "role_id": user.role_id,
        "user_id": user.id,
        "province_id": 0 if user.role_id == secret.s_admin_role else user.province_id,
        "username": user.username,
        "useremail": user.email,
        "active": user.active
    })

    return {
        "status": True,
        "details": "Simulated login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

#open in new window
@access_router.get("/simulate-login-handler", response_model=LoginResponse)
def verify_token(token: str, userId: int, db: Session = Depends(get_db), curr_user: User = Depends(authenticate)):
    try:
        # Verify the token and extract user data
        payload = verifyToken(token)
    except HTTPException as e:
        # If the token is invalid, return an error response
        return {"status": False, "details": "Invalid token."}, 401

    # If the token is valid, extract user info
    if payload.user_id != userId:
        return {"status": False, "details": "User ID does not match the token."}, 401

    user_id = payload.user_id
    role_id = payload.role_id
    username = payload.username  # Ensure your Token model has these fields
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"status": False, "details": "User not found."}, 404

    # You can either return the original token or generate a new one (based on your use case)
    token_str = token

    # Return the same structure as the simulate-login response
    return {
        "status": True,
        "details": "Simulated login successful",
        "access_token": token_str,
        "token_type": "bearer",
        "user": user
    }
    
#get current user by id
@access_router.get('/user-permissions-by-id', response_model=PermissionUser)
def get_user_permissions_by_id(user_id: int = Query(...),token: str = Depends(oauth2_scheme),db: Session = Depends(get_db)):
    curr_user = verifyToken(token)

    # Only superadmin or province admin can query other users
    if curr_user.role_id not in [secret.s_admin_role, secret.p_admin_role]:
        raise HTTPException(status_code=403, detail="You do not have permission to access this.")

    # Get target user info
    user_data = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.id == user_id)
        .first()
    )
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found.")

    check_admin = user_data.role_id in [secret.s_admin_role, secret.p_admin_role]

    # Permissions: community & society
    community = authenticate_permission_user(
        user_id=user_data.id,
        role_id=user_data.role_id,
        province_id=user_data.province_id,
        db=db,
        query=db.query(Community),
        port_model=Community,
        type="community"
    ).first()

    society = authenticate_permission_user(
        user_id=user_data.id,
        role_id=user_data.role_id,
        province_id=user_data.province_id,
        db=db,
        query=db.query(Society),
        port_model=Society,
        type="society"
    ).first()

    legal_entities = (
        db.query(LegalEntity.portfolio_id)
        .join(LegalEntityUser)
        .filter(LegalEntityUser.user_id == user_id)
        .group_by(LegalEntity.portfolio_id)
        .all()
    )

    portfolios = db.query(Portfolio.id, Portfolio.name).filter(Portfolio.type == 'Non Financial').all()

    # Use the *target user's* role for feature permissions
    role_module_features = db.query(RoleModuleFeature).filter(
        RoleModuleFeature.role_id == user_data.role_id
    ).all()
    role_permissions = {}
    for i in role_module_features:
        module = i.module_feature.module.name.lower()
        feature = i.module_feature.feature.name.lower()
        role_permissions.setdefault(module, {})[feature] = i.status

    permissions = {
        **{
            portfolio.name.lower(): True if check_admin else bool(
                [i for i in legal_entities if i.portfolio_id == portfolio.id]
            )
            for portfolio in portfolios
        },
        "community": True if check_admin else bool(community),
        "society": True if check_admin else bool(society),
        "role_permissions": role_permissions,
        "dashboard": True
    }

    return  {
        "status": True,
        "details": "User fetched successfully",
        "data": user_data,
        "permissions": permissions
    }


#API for current User Update with profile pic
root_file_path = os.path.join(root_path, 'files')

def save_profile_pic(user_name: str, profile_pic: Optional[UploadFile]) -> Optional[list[dict]]:
    if not profile_pic:
        return None

    try:
        # Corrected path (no double 'files')
        folder_path = os.path.join(root_file_path, "userProfilePic", user_name)
        os.makedirs(folder_path, exist_ok=True)

        file_ext = os.path.splitext(profile_pic.filename)[1].lower()
        if file_ext not in [".jpg", ".jpeg", ".png", ".gif"]:
            raise ValueError("Invalid profile image type")

        filename = f"profile_{uuid4().hex}_file_version_1{file_ext}"
        full_path = os.path.join(folder_path, filename)

        with open(full_path, "wb") as f:
            shutil.copyfileobj(profile_pic.file, f)

        relative_path = os.path.join("files", "userProfilePic", user_name, filename)

        return [{
            "file_name": filename,
            "version": 1,
            "file_extension": file_ext,
            "file_location": relative_path,
            "file_size": os.path.getsize(full_path),
            "question_name": "Profile Picture",
            "question_type": "image"
        }]

    except Exception as e:
        print("Exception in saving profile pic:", e)
        raise ValueError("Failed to save profile picture")
    
    
@access_router.put('/current-user/put', response_model=AccessResponseModel)
def update_current_user(user: str = Form(None), profile_pic: Optional[UploadFile] = File(None),db: Session = Depends(get_db),curr_user: Token = Depends(authenticate)):
    try:
        user_data = json.loads(user)

        user_obj = db.query(User).filter(User.id == curr_user.user_id).first()
        if not user_obj:
            return {"status": False, "details": "User not found"}

        # Check for username uniqueness if updated
        new_username = user_data.get("username")
        if new_username and new_username != user_obj.username:
            existing_user = db.query(User).filter(User.username == new_username).first()
            if existing_user:
                return {"status": False, "details": "Username already exists"}

        skip_fields = ['password', 'id']

        for key, value in user_data.items():
            if key in skip_fields:
                continue
            # Skip empty strings or None values to keep previous data
            if value is None or (isinstance(value, str) and value.strip() == ""):
                continue
            if hasattr(user_obj, key):
                setattr(user_obj, key, value)

        if profile_pic:
            old_pic_path = user_obj.profile_pic
            if old_pic_path and os.path.isfile(old_pic_path):
                try:
                    os.remove(old_pic_path)
                except Exception as e:
                    print(f"Failed to delete old profile pic: {e}")

            folder_name = user_obj.username or f"user_{user_obj.id}"
            pic_data = save_profile_pic(folder_name, profile_pic)
            if pic_data:
                user_obj.profile_pic = pic_data[0]["file_location"]

        db.commit()
        db.refresh(user_obj)

        return {
            "status": True,
            "details": "User updated successfully",
            "data": user_obj
        }

    except ValidationError as e:
        return ResponseSchema(status=False, details=e.errors())
    except Exception as e:
        print("Error:", e)
        return ResponseSchema(status=False, details="Invalid data")



#API for current User Profile Pic view
@access_router.get("/profile/view-profile-pic")
def view_profile_pic(token: str, db: Session = Depends(get_db)):
    # 1. Decode token
    data = verify_file_token(token)
    if not data:
        return ResponseSchema(status=False, details="Invalid token")

    # 2. Get user
    user = db.query(User).filter(User.id == data.get("user_id")).first()
    if not user:
        return ResponseSchema(status=False, details="User not found")

    # 3. Ensure profile_pic is set
    if not user.profile_pic:
        return ResponseSchema(status=False, details="No profile picture found")

    file_path = os.path.join(root_path, user.profile_pic)
    if not os.path.exists(file_path):
        return ResponseSchema(status=False, details="File not found")

    # 4. Detect media type
    ext = os.path.splitext(user.profile_pic)[1].lower()
    media_type = "application/octet-stream"
    if ext in [".jpg", ".jpeg"]:
        media_type = "image/jpeg"
    elif ext == ".png":
        media_type = "image/png"
    elif ext == ".gif":
        media_type = "image/gif"

    # 5. Serve file inline
    return FileResponse(
        file_path,
        media_type=media_type,
        headers={"Content-Disposition": f"inline; filename={os.path.basename(file_path)}"}
    )

