from fastapi import APIRouter, Depends, HTTPException

from models.audit import Log
from sqlalchemy.orm import Session
from sqlalchemy import func

from settings.db import get_db
from settings.auth import authenticate, Token

router = APIRouter(
    prefix="/audit",
    tags=["Audit"]
)

# Audit report
@router.get("/auditlist")
def get_audit_list(skip: int = 0, limit: int = 10, module:str=None, modification_type:str=None, search: str = None, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    province_id= curr_user.province_id
    query = db.query(Log)
    if province_id:
        query = query.filter(Log.province_id == province_id)
    if module:
        query = query.filter(Log.module_name == module)
    if modification_type:
        query = query.filter(Log.modification_type == modification_type)
    if search:
        query = query.filter(func.lower(Log.module_name).contains(search.lower()))
    total_count = query.count()
    query = query.order_by(Log.log_id.desc())
    data = query.offset(skip).limit(limit).all()

    return {"status": True, "details": "Audit reports fetched successfully", "total_count": total_count, "data": data}

@router.get("/community/{community_id}")
def get_community_audit_list(community_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    province_id= curr_user.province_id
    query = db.query(Log).filter(Log.record_id == community_id, Log.module_name == 'Community')
    if province_id:
        query = query.filter(Log.province_id == province_id)
    total_count = query.count()
    query = query.order_by(Log.log_id.asc())
    data = query.all()

    return {"status": True, "details": "Audit reports fetched successfully", "total_count": total_count, "data": data}

@router.get("/society/{society_id}")
def get_community_audit_list(society_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    province_id= curr_user.province_id
    query = db.query(Log).filter(Log.record_id == society_id, Log.module_name == 'Society')
    if province_id:
        query = query.filter(Log.province_id == province_id)
    total_count = query.count()
    query = query.order_by(Log.log_id.asc())
    data = query.all()

    return {"status": True, "details": "Audit reports fetched successfully", "total_count": total_count, "data": data}

@router.get("/legalentity/{legal_entity_id}")
def get_community_audit_list(legal_entity_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    province_id= curr_user.province_id
    query = db.query(Log).filter(Log.record_id == legal_entity_id, Log.module_name == 'LegalEntity')
    if province_id:
        query = query.filter(Log.province_id == province_id)
    total_count = query.count()
    query = query.order_by(Log.log_id.asc())
    data = query.all()

    return {"status": True, "details": "Audit reports fetched successfully", "total_count": total_count, "data": data}


@router.get("/user/{user_id}")
def get_community_audit_list(user_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    province_id= curr_user.province_id
    query = db.query(Log).filter(Log.record_id == user_id, Log.module_name == 'User')
    if province_id:
        query = query.filter(Log.province_id == province_id)
    total_count = query.count()
    query = query.order_by(Log.log_id.asc())
    data = query.all()

    return {"status": True, "details": "Audit reports fetched successfully", "total_count": total_count, "data": data}