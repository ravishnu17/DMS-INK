from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from settings.db import get_db
from typing import List  
from settings.auth import authenticate
from settings.config import secret

from schemas.access_control import Token
from schemas.weblinks import WebLink,WebLinksResponse,WebLinksUpdate
from models.weblinks import WebLinks
from constants.constant import limit_count

router = APIRouter(
    prefix="/weblinks",
    tags=["weblinks"]
)

@router.post("/create", response_model=WebLinksResponse)
async def create_weblinks(web_link: WebLink, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    # Check if the Province_id 
    web_link.province_id= web_link.province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not web_link.province_id:
        return WebLinksResponse(status=False, message="Province not found")
    # Check if the weblink already exists
    existing_link = db.query(WebLinks).filter(WebLinks.weblink == web_link.weblink).first()
    if existing_link:
        raise HTTPException(status_code=400, detail="Web link already exists")
    
    # Create new web link entry
    new_weblink = WebLinks(name=web_link.name, weblink=web_link.weblink, province_id=web_link.province_id,created_by= curr_user.user_id, updated_by= curr_user.user_id)
    db.add(new_weblink)
    db.commit()
    db.refresh(new_weblink)
    
    return {"message": "Web link created successfully", "status": True, "data": new_weblink}


@router.get("/get")
async def get_weblinks(skip: int = 0, limit: int = limit_count, search: str = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    weblinks = db.query(WebLinks).order_by(WebLinks.id.desc())
    
    if search:
        weblinks = weblinks.filter(func.lower(WebLinks.name).contains(search.lower())| func.lower(WebLinks.weblink).contains(search.lower()))
    
    total_count = weblinks.count()
    if limit != 0:
        weblinks = weblinks.offset(skip).limit(limit).all()
    else:
        weblinks = weblinks.all()
    
    return {"status":True,"message":"Web links fetched successfully","total_count":total_count,"data":weblinks}


@router.put("/update/{id}")
async def update_weblink(id: int, web_link: WebLinksUpdate, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    weblink = db.query(WebLinks).filter(WebLinks.id == id).first()
    
    if not weblink:
        raise HTTPException(status_code=404, detail="Web link not found")
    
    # Update fields
    weblink.name = web_link.name
    weblink.weblink = web_link.weblink
    weblink.province_id=web_link.province_id
    weblink.active = web_link.active
    weblink.updated_by = curr_user.user_id
    
    db.commit()
    db.refresh(weblink)
    
    return {"status":True,"message":"Web link updated successfully"}

@router.delete("/delete/{id}")
async def delete_weblink(id: int, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    delete_weblink = db.query(WebLinks).filter(WebLinks.id == id).first()
    
    if not delete_weblink:
        raise HTTPException(status_code=404, detail="Web link not found")
    
    db.delete(delete_weblink)
    db.commit()
    
    return {"status":True,"message":"Web link deleted successfully"}  # Return the object before it was deleted


