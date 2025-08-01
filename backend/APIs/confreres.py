from fastapi import APIRouter, Depends, HTTPException,UploadFile,File
from sqlalchemy.orm import Session
from sqlalchemy import func
from settings.db import get_db
from typing import List  
from settings.auth import authenticate
from settings.config import secret
from schemas.access_control import Token
from schemas.confreres import ConfreresResponse,ConfreresSchema,ViewConfrere,UpdateConfreres    
from models.confreres import Confreres
from constants.constant import get_new_code,authenticate_permission,limit_count
from datetime import datetime
import pandas as pd
import io
from io import BytesIO
from fastapi.responses import StreamingResponse

router=APIRouter(prefix="/confreres",tags=["confreres"])

#Confreres Sample-Export
@router.get("/sample-excel")
async def get_sample_excel_confreres(db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    columns = ['Name', 'Email', 'Country_Code','Mobile_No']

    # Convert to DataFrame
    df = pd.DataFrame(columns=columns)

    # Save to an Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name="Confreres Sample")

        # Formatting the Excel Sheet
        workbook = writer.book
        worksheet = writer.sheets["Confreres Sample"]

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
        headers={"Content-Disposition": f"attachment; filename=Confreres_sample_{datetime.now().strftime('%Y-%m-%d')}.xlsx"}
    )
    
#Confreres Export
@router.get("/export")
async def export_confreres(db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    query = db.query(Confreres)

    # Check permission
    query = authenticate_permission(curr_user, db, query, Confreres, "confreres")
    confreres = query.order_by(Confreres.name.asc()).all()

    # Define columns
    columns = ["S.No", "Code", "Name", "Email","Country_Code", "Mobile_No"]
    confreres_data = []

    # Populate data if available
    for index, d in enumerate(confreres):
        confreres_data.append({
            "S.No": index + 1,
            "Code": d.code,
            "Name": d.name,
            "Email": d.email,
            "Country_Code": d.country_code,
            "Mobile_No": d.mobile_no

        })

    # If no data, just create a single empty row with headers
    if not confreres_data:
        confreres_data.append({col: "" for col in columns})

    # Convert to DataFrame
    df = pd.DataFrame(confreres_data)

    # Write to Excel
    output = BytesIO()
    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="confreres")

        # Format headers
        workbook = writer.book
        worksheet = writer.sheets["confreres"]
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
            "Content-Disposition": f"attachment; filename=confreres_export_{datetime.now().strftime('%Y-%m-%d')}.xlsx"
        }
    )
    
#Confreres Import
@router.post("/import")
async def import_confreres(file: UploadFile = File(...),province_id: int = None,db: Session = Depends(get_db),curr_user: Token = Depends(authenticate),):
    # Verify Province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ConfreresResponse(status=False, message="Province not found")

    # Validate File Extension
    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ConfreresResponse(status=False, message=f"Only Excel({', '.join(allowed)}) files are allowed")

    # Read File into DataFrame
    contents = file.file.read()
    try:
        if file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents), keep_default_na=False)
        else:
            df = pd.read_csv(io.BytesIO(contents), keep_default_na=False)
    except Exception as e:
        return ConfreresResponse(status=False, message=f"Failed to read file: {str(e)}")
    
    if df.empty:
        return ConfreresResponse(status=False, message="The uploaded file is empty. No data to import.")  

    # Required Columns
    required_columns = {"Name", "Email", "Mobile_No", "Country_Code"}
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ConfreresResponse(status=False, message=f"Missing required columns: {missing_columns}")


    new_confreres = []

    # Parse and Validate Each Row
    for index, (_, row) in enumerate(df.iterrows()):
        if 'Name' not in row or not str(row['Name']).strip():
            return ConfreresResponse(status=False,message=f"Email is empty in row{index + 1}")
        if 'Email' not in row or not str(row['Email']).strip():
            return ConfreresResponse(status=False,message=f"Email is empty in row{index + 1}")
        if 'Mobile_No' not in row or not str(row['Mobile_No']).strip():
            return ConfreresResponse(status=False,message=f"Mobile_No is empty in row{index + 1}")
        if 'Country_Code' not in row or not str(row['Country_Code']).strip():
            return ConfreresResponse(status=False,message=f"Country_Code is empty in row{index + 1}")
        
        name = " ".join(row.get("Name", "").split())
        email = row.get("Email", "")
        mobile_no = row.get("Mobile_No", "")
        country_code=row.get("Country_Code","")
        

        new_confreres.append({
            "name": name,
            "email": email,
            "mobile_no": mobile_no,
            "country_code": country_code,
        })

    # Insert into DB
    inserted_ids = []
    for row in new_confreres:
        try:
            new_entry = Confreres(
                province_id=province_id,
                code=get_new_code(db, Confreres, "CON"),
                name=row["name"],
                email=row["email"],
                mobile_no=row["mobile_no"],
                country_code=row["country_code"],
                created_by=curr_user.user_id,
                updated_by=curr_user.user_id,
            )
            db.add(new_entry)
            db.commit()
            db.refresh(new_entry)
            inserted_ids.append(new_entry.id)
        except Exception as e:
            db.query(Confreres).filter(Confreres.id.in_(inserted_ids)).delete(synchronize_session=False)
            db.commit()
            return ConfreresResponse(status=False, message=f"Error adding Confreres {row['name']}: {str(e)}")

    return ConfreresResponse(status=True, message="Confreres imported successfully")


@router.post("/post")
async def post_confreres(payload:ConfreresSchema,db:Session=Depends(get_db),curr_user:Token=Depends(authenticate)):
    payload.province_id= payload.province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not payload.province_id:
        return ConfreresResponse(status=False, message="Province not found")
    payload.code=get_new_code(db,Confreres,"CON")
    confrere=Confreres(**payload.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id)
    
    db.add(confrere)
    db.commit()
    db.refresh(confrere)
    return {"status":True,"message":"Confreres Created Successfully"}


@router.get("/get")
async def get_confreres(skip: int = 0, limit: int = limit_count, search: str = None, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    confreres = db.query(Confreres).order_by(Confreres.id.desc())
    
    if search:
        confreres = confreres.filter(func.lower(Confreres.name).contains(search.lower())| func.lower(Confreres.email).contains(search.lower())| func.lower(Confreres.code).contains(search.lower()))
    
    total_count = confreres.count()
    if limit != 0:
        confreres = confreres.offset(skip).limit(limit).all()
    else:
        confreres = confreres.all()
    
    return {"status":True,"message":"Web links fetched successfully","total_count":len(confreres),"data":confreres}

@router.put("/{confrere_id}")
async def update_confrere(confrere_id: int, payload: UpdateConfreres, db: Session = Depends(get_db),curr_user:Token=Depends(authenticate)):
    confrere = db.query(Confreres).filter(Confreres.id == confrere_id).first()
    if not confrere:
        raise HTTPException(status_code=404, detail="Confrere not found")

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(confrere, key, value)

    db.commit()
    db.refresh(confrere)
    return {"status": True, "message": "Confrere updated"}

@router.get("/{confrere_id}")
async def get_confrere_by_id(confrere_id: int, db: Session = Depends(get_db),curr_user:Token=Depends(authenticate)):
    confrere = db.query(Confreres).filter(Confreres.id == confrere_id).first()
    if not confrere:
        raise HTTPException(status_code=404, detail="Confrere not found")
    return {"status": True, "message": "Confrere fetched","details": confrere}

@router.delete("/{confrere_id}")
async def delete_confrere(confrere_id: int, db: Session = Depends(get_db),curr_user:Token=Depends(authenticate)):
    confrere = db.query(Confreres).filter(Confreres.id == confrere_id).first()
    if not confrere:
        raise HTTPException(status_code=404, detail="Confrere not found")
    db.delete(confrere)
    db.commit()
    return {"status": True, "message": "Confrere deleted"}


