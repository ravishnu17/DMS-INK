from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from typing import List
from models.configuration import Portfolio, LegalEntity, CFP, SFP, LEFP, FinancialPortfolioMap
from models.category import (FinancialYear, DataTypes, FileTypes, Category, CategoryFinancialDueMap, 
    CategoryForm, CategoryFormFileTypeMap, CategoryFormOptions, PortfolioCategoryMap)
from schemas.category import (FinancialYearSchema, DataTypesSchema, FileTypesSchema, CategoryFormSchema, CategoryUpdateFormSchema,
    CategorySchema, ResponseSchema, CategoryResponse, CategoryFormOrderSchema)
from models.answers import Answer, AnswerData
from schemas.access_control import Token
from settings.db import get_db
from settings.auth import authenticate, authAdmin
from settings.config import secret
from constants.constant import limit_count
import pandas as pd
from io import BytesIO, StringIO
from sqlalchemy import case

router = APIRouter(
    prefix="/category",
    tags=["Category"]
)

# ---------------- Financial year APIs ----------------

# add
@router.post('/financialyear')
async def add_financial_year(financial_year: List[FinancialYearSchema], db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    for i in financial_year:
        if db.query(FinancialYear).filter(FinancialYear.year == i.year).first():
            return {"status": False, "details": f"Financial year {i.year} already exists"}
        financial_year_data= FinancialYear(**i.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id)
        db.add(financial_year_data)
        db.commit()
    return ResponseSchema(status=True, details="Financial year added successfully")

# get
@router.get('/financialyear', response_model= ResponseSchema)
async def get_financial_year(skip: int= 0, limit: int= limit_count,search: str= None,db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    query = db.query(FinancialYear).order_by(FinancialYear.id.desc())
    if search:
        query= query.filter(func.lower(FinancialYear.year).contains(search.lower()))

    total_count= query.count()

    if limit !=0:
        query= query.offset(skip).limit(limit)
    data = query.all()
    return { "status": True,"details":"Financial year fetched successfully","data": data, "total_count": total_count }

# update
@router.put('/financialyear/{id}')
async def update_financial_year(id: int, financial_year: FinancialYearSchema, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    financial_year_data= db.query(FinancialYear).filter(FinancialYear.id == id)
    if not financial_year_data.first():
        return ResponseSchema(status=False, details="Financial year not found")
    if db.query(FinancialYear).filter(FinancialYear.year == financial_year.year).first():
        return ResponseSchema(status=False, details=f"Financial year {financial_year.year} already exists")
    financial_year_data.update({**financial_year.model_dump(), "updated_by": curr_user.user_id}, synchronize_session=False)
    db.commit()
    return ResponseSchema(status=True, details="Financial year updated successfully")

# delete
@router.delete('/financialyear/{id}')
async def delete_financial_year(id: int, db:Session= Depends(get_db), curr_user:Token= Depends(authAdmin)):
    financial_year_data= db.query(FinancialYear).filter(FinancialYear.id == id)
    if not financial_year_data.first():
        return ResponseSchema(status=False, details="Financial year not found")
    if db.query(CategoryFinancialDueMap).filter(CategoryFinancialDueMap.financial_year_id == id).first():
        return ResponseSchema(status=False, details="Financial year assigned to category forms")
    if db.query(Answer).filter(Answer.financial_year == id).first():
        return ResponseSchema(status=False, details="Financial year assigned to answers")
    financial_year_data.delete(synchronize_session= False)
    db.commit()
    return ResponseSchema(status=True, details="Financial year deleted successfully")


# ---------------- Data Types APIs ----------------

# Add Data Type
@router.post('/datatypes')
async def add_data_types(data_types: List[DataTypesSchema], db: Session = Depends(get_db), curr_user:Token=Depends(authAdmin)):
    for i in data_types:
        if db.query(DataTypes).filter(DataTypes.name == i.name).first():
            return {"status": False, "details": f"Data type '{i.name}' already exists"}
        data_type_entry = DataTypes(**i.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id)
        db.add(data_type_entry)
        db.commit()
    return ResponseSchema(status=True, details="Data types added successfully")

# Get Data Types
@router.get('/datatypes', response_model=ResponseSchema)
async def get_data_types(skip: int = 0, limit: int = limit_count, search: str = None, db: Session = Depends(get_db), curr_user=Depends(authenticate)):
    query = db.query(DataTypes).order_by(DataTypes.id.asc())
    if search:
        query = query.filter(func.lower(DataTypes.name).contains(search.lower()))

    total_count = query.count()

    if limit != 0:
        query = query.offset(skip).limit(limit)
    data = query.all()

    return {"status": True,"details":"Data types fetched successfully","data": data, "total_count": total_count }

# Update Data Type
@router.put('/datatypes/{id}')
async def update_data_type(id: int, data_type: DataTypesSchema, db: Session = Depends(get_db), curr_user=Depends(authAdmin)):
    data_type_data = db.query(DataTypes).filter(DataTypes.id == id)
    if not data_type_data.first():
        return ResponseSchema(status=False, details="Data type not found")
    if db.query(DataTypes).filter(DataTypes.name == data_type.name).first():
        return ResponseSchema(status=False, details=f"Data type '{data_type.name}' already exists")
    data_type_data.update({**data_type.model_dump(), "updated_by": curr_user.user_id}, synchronize_session=False)
    db.commit()
    return ResponseSchema(status=True, details="Data type updated successfully")

# Delete Data Type
@router.delete('/datatypes/{id}')
async def delete_data_type(id: int, db: Session = Depends(get_db), curr_user=Depends(authAdmin)):
    data_type_data = db.query(DataTypes).filter(DataTypes.id == id)
    if not data_type_data.first():
        return ResponseSchema(status=False, details="Data type not found")
    if db.query(CategoryForm).filter(CategoryForm.data_type_id == id).first():
        return ResponseSchema(status=False, details="Data type assigned to category form")
    data_type_data.delete(synchronize_session=False)
    db.commit()
    return ResponseSchema(status=True, details="Data type deleted successfully")


# ---------------- File Types APIs ----------------

# Add File Type
@router.post('/filetypes')
async def add_file_types(file_types: List[FileTypesSchema], db: Session = Depends(get_db), curr_user=Depends(authenticate)):
    for i in file_types:
        if db.query(FileTypes).filter(FileTypes.name == i.name).first():
            return {"status": False, "details": f"File type '{i.name}' already exists"}
        file_type_entry = FileTypes(**i.model_dump())
        db.add(file_type_entry)
        db.commit()
    return ResponseSchema(status=True, details="File types added successfully")

# Get File Types
@router.get('/filetypes')
async def get_file_types(db: Session = Depends(get_db), curr_user=Depends(authenticate)):
    image = db.query(FileTypes).filter(FileTypes.data_type_id.in_(db.query(DataTypes.id).filter(DataTypes.name == 'Image').scalar_subquery())).all()
    fil_upload= db.query(FileTypes).filter(FileTypes.data_type_id.in_(db.query(DataTypes.id).filter(DataTypes.name == 'File Upload').scalar_subquery())).all()
    data = { "image": image, "file_upload": fil_upload }

    return { "status": True,"details":"File types fetched successfully","data": data }

# Update File Type
@router.put('/filetypes/{id}')
async def update_file_type(id: int, file_type: FileTypesSchema, db: Session = Depends(get_db), curr_user=Depends(authenticate)):
    file_type_data = db.query(FileTypes).filter(FileTypes.id == id)
    if not file_type_data.first():
        return ResponseSchema(status=False, details="File type not found")
    if db.query(FileTypes).filter(FileTypes.name == file_type.name, FileTypes.id != id).first():
        return ResponseSchema(status=False, details=f"File type '{file_type.name}' already exists")
    file_type_data.update({**file_type.model_dump()}, synchronize_session=False)
    db.commit()
    return ResponseSchema(status=True, details="File type updated successfully")

# Delete File Type
@router.delete('/filetypes/{id}')
async def delete_file_type(id: int, db: Session = Depends(get_db), curr_user=Depends(authAdmin)):
    file_type_data = db.query(FileTypes).filter(FileTypes.id == id)
    if not file_type_data.first():
        return ResponseSchema(status=False, details="File type not found")
    if db.query(CategoryFormFileTypeMap).filter(CategoryFormFileTypeMap.file_type_id == id).first():
        return ResponseSchema(status=False, details="File type assigned to category form")
    file_type_data.delete(synchronize_session=False)
    db.commit()
    return ResponseSchema(status=True, details="File type deleted successfully")

# -------------------------Mapp portfolio with category

# mapp category with portfolio
@router.post('/mapp', response_model=ResponseSchema)
async def category_mapp(portfolio_id: int, category_ids: List[int], db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    portfolio_data= db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio_data:
        return ResponseSchema(status=False, details="Portfolio not found")
    mapp= db.query(PortfolioCategoryMap).filter(PortfolioCategoryMap.portfolio_id == portfolio_id).all()
    exist= []
    new_category_mapp= []
    for i in category_ids:
        if not db.query(Category).filter(Category.id == i, Category.active == True, Category.province_id == curr_user.province_id).first():
            return ResponseSchema(status=False, details=f"{i} - Category not found")
        if i in map(lambda x: x.category_id, mapp):
            exist.append(i)
            continue

        new_category_mapp.append(PortfolioCategoryMap(category_id= i, portfolio_id= portfolio_id, created_by= curr_user.user_id, updated_by= curr_user.user_id))

    # delete category unmapp
    if exist:
        unmap_data= db.query(PortfolioCategoryMap).filter(PortfolioCategoryMap.portfolio_id == portfolio_id, 
                    PortfolioCategoryMap.category_id.notin_(exist),
                    PortfolioCategoryMap.category_id.in_(
                        db.query(Category.id).filter(Category.province_id == curr_user.province_id, Category.active == True).scalar_subquery()) 
                )
    else:
        unmap_data= db.query(PortfolioCategoryMap).filter(PortfolioCategoryMap.portfolio_id == portfolio_id, 
            PortfolioCategoryMap.category_id.in_(
                db.query(Category.id).filter(Category.province_id == curr_user.province_id, Category.active == True).scalar_subquery()) 
        )
    unmaps= unmap_data.all()
    # remove exist mapping and set active to false in answers
    if unmaps:
        for unmap in unmaps:
            answers= db.query(Answer.id).filter(Answer.category_id == unmap.category_id)
            if portfolio_data.type.lower() == 'non financial':
                if portfolio_data.name.lower() == 'community':
                    ans= db.query(AnswerData).filter(AnswerData.answer_id.in_(answers.filter(Answer.community_id.isnot(None)).scalar_subquery()))
                    if ans.first(): ans.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)
                elif portfolio_data.name.lower() == 'society':
                    ans= db.query(AnswerData).filter(AnswerData.answer_id.in_(answers.filter(Answer.society_id.isnot(None)).scalar_subquery()))
                    if ans.first(): ans.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)
                else:
                    ans= db.query(AnswerData).filter(AnswerData.answer_id.in_(answers.filter(Answer.legal_entity_id.isnot(None)).join(Answer.legal_entity).filter(LegalEntity.portfolio_id == portfolio_id).scalar_subquery()))
                    if ans.first(): ans.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)
            else:
                ans= db.query(AnswerData).filter(AnswerData.answer_id.in_(answers.filter(Answer.cfp_id.isnot(None)).join(CFP, Answer.cfp_id == CFP.id).filter(CFP.portfolio_id == portfolio_id).scalar_subquery()))
                if ans.first(): ans.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)

                ans= db.query(AnswerData).filter(AnswerData.answer_id.in_(answers.filter(Answer.sfp_id.isnot(None)).join(SFP, Answer.sfp_id == SFP.id).filter(SFP.portfolio_id == portfolio_id).scalar_subquery()))
                if ans.first(): ans.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)

                ans= db.query(AnswerData).filter(AnswerData.answer_id.in_(answers.filter(Answer.lefp_id.isnot(None)).join(LEFP, Answer.lefp_id == LEFP.id).filter(LEFP.portfolio_id == portfolio_id).scalar_subquery()))
                if ans.first(): ans.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)

        unmap_data.delete(synchronize_session=False)
    db.commit()

    if new_category_mapp:
        db.add_all(new_category_mapp)
        db.commit()
        
    return ResponseSchema(status=True, details="Category mapped successfully")

# get portfolios with category counts
@router.get('/mapp', response_model=ResponseSchema)
async def get_category_mapp(skip: int = 0, limit: int = limit_count, search: str = None, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    query= db.query(Portfolio).order_by(Portfolio.id.asc())

    if search:
        query= query.filter(func.lower(Portfolio.name).contains(search.lower()) | 
            func.lower(Portfolio.type).contains(search.lower())
        )

    total_count= query.count()
    if limit != 0:
        data= query.offset(skip).limit(limit).all()
    else:
        data= query.all()
    
    for i in data:
        i.category_count= db.query(PortfolioCategoryMap).filter(PortfolioCategoryMap.portfolio_id == i.id, PortfolioCategoryMap.category_id.in_( 
            db.query(Category.id).filter( Category.province_id == curr_user.province_id, Category.active == True).scalar_subquery())).count()
        i.mapped_count= db.query(FinancialPortfolioMap).filter(FinancialPortfolioMap.non_financial_portfolio_id == i.id).count()

    return { "status": True,"details":"Portfolios fetched successfully","data": data, "total_count": total_count }

# get category by portfolio id
@router.get('/mapp/{portfolio_id}', response_model=ResponseSchema)
async def get_category_mapp(
    portfolio_id: int,
    skip: int = 0,
    limit: int = limit_count,
    search: str = None,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    # Define ordering logic based on Category fields
    order_by_case = case(
    ((Category.is_renewal == False) & (Category.is_due == False), 0),
    (Category.is_renewal == True, 1),
    else_=2
    )


    # Base query with join to Category
    query = db.query(PortfolioCategoryMap).join(Category, PortfolioCategoryMap.category_id == Category.id).filter(
        PortfolioCategoryMap.portfolio_id == portfolio_id,
        Category.province_id == curr_user.province_id,
        Category.active == True
    )

    # Optional search filter
    if search:
        query = query.filter(func.lower(Category.name).contains(search.lower()))

    # Apply ordering
    query = query.order_by(order_by_case, PortfolioCategoryMap.id)

    total_count = query.count()
    if limit != 0:
        data = query.offset(skip).limit(limit).all()
    else:
        data = query.all()

    return {
        "status": True,
        "details": "Category mapp fetched successfully",
        "total_count": total_count,
        "data": data
    }
# ---------------- Category APIs ----------------
val_or_null= lambda obj, key: obj[key] if pd.notna(obj[key]) and obj[key] else None

# import category
@router.post('/import')
async def import_category(file: UploadFile = File(...), province_id: int = None, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    # Verify province
    province_id = province_id if curr_user.role_id == secret.s_admin_role else curr_user.province_id
    if not province_id:
        return ResponseSchema(status=False, details="Province not found")

    allowed = ['.xlsx', '.xls', '.csv']
    if not any(file.filename.endswith(ext) for ext in allowed):
        return ResponseSchema(status=False, details=f"Only Excel({', '.join(allowed)}) files are allowed")

    # Read Excel or CSV file into DataFrame
    if file.filename.endswith('.csv'):
        contents= StringIO(file.file.read().decode('utf-8'))
        df = pd.read_csv(contents, keep_default_na=False)
    else:
        contents= BytesIO(file.file.read()) 
        df = pd.read_excel(contents, keep_default_na=False)

    # Check if DataFrame is empty
    if df.empty:
        return ResponseSchema(status=False, details="The uploaded file is empty.")
    # Required Columns 
    required_columns = {"Name", "Type","Renewal", "Due", "Question type", "Question name", "Placeholder", "Required", "Question order", "Portfolio name" }
    # Validate if required columns exist
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        return ResponseSchema(status=False, details=f"Missing required columns: {missing_columns}")
    
    # get all data types
    data_types= {i.name.lower(): i.id for i in db.query(DataTypes).all()}
    # get all file types
    file_types= {i.name.lower(): i.id for i in db.query(FileTypes).all()}
    # portfolio data
    portfolio_data= {i.name.lower(): i.id for i in db.query(Portfolio).all()}
    Validated_data= []
    for index, sheet_data in df.iterrows():
        row_num= index + 2
        portfolio_name= val_or_null(sheet_data, "Portfolio name")
        
        category_name= val_or_null(sheet_data, "Name")
        if not category_name:
            return ResponseSchema(status=False, details=f"In row {row_num} - Category name is required")
        
        category_type= sheet_data.get("Type", None) #  val_or_null(sheet_data, "Type")
        # if not category_type:
        #     return ResponseSchema(status=False, details=f"In row {row_num} - Category type is required")
        
        # check same name
        if db.query(Category).filter(Category.name == category_name, Category.type == category_type, Category.province_id == province_id, Category.active == True).first():
            return ResponseSchema(status=False, details=f"In row {row_num} - Category '{category_name}' already exists")
        
        # category data
        category_data= {
            "province_id": province_id,
            "name": category_name,
            "type": category_type,
            "is_renewal": bool(sheet_data['Renewal']),
            "is_due": bool(sheet_data['Due']),
            "renewal_iteration": val_or_null(sheet_data, "Renewal period"),
            "description": val_or_null(sheet_data, "Description")
        }
        category_due_data={}
        # check if category already exist
        exist= next((i for i in Validated_data if category_data == {"province_id": i["province_id"], "name": i["name"], "type": i["type"], "is_renewal": i["is_renewal"], "is_due": i["is_due"], "renewal_iteration": i["renewal_iteration"], "description": i["description"]}), None)

        #  add portfolio
        portfolio_list= list(map(lambda x: portfolio_data.get(x.strip().lower(), None), portfolio_name.split(","))) if portfolio_name else []
        if exist:
            exist["portfolio"]= set([*exist["portfolio"], *portfolio_list])
        else:
            category_data["portfolio"]= portfolio_list

        #  category financial due map
        if category_data["is_due"]:
            fin_year= val_or_null(sheet_data, "Financial year")
            if not fin_year:
                return ResponseSchema(status=False, details=f"Financial year not found in row {row_num}")
            due_day= val_or_null(sheet_data, "Due day")
            due_month= val_or_null(sheet_data, "Due month")
            if not due_day or not due_month:
                return ResponseSchema(status=False, details="Due day and month are required for due categories")
            financial_year= db.query(FinancialYear).filter(FinancialYear.year ==  fin_year).order_by(FinancialYear.id.desc()).first()
            if not financial_year:
                return ResponseSchema(status=False, details="Financial year not found")
            category_due_data= {
                "financial_year_id": financial_year.id,
                "due_day": due_day,
                "due_month": due_month
            }
        required= ['Question name', 'Question type', 'Placeholder', 'Required', 'Question order']
        if not all(pd.notna(sheet_data[i]) and sheet_data[i] != '' for i in required):
            return ResponseSchema(status=False, details=f"Missing required columns: {', '.join(required)} in row {row_num}")
        
        data_type_name= sheet_data['Question type'].strip()
        if not data_types.get(data_type_name.lower()):
            return ResponseSchema(status=False, details=f"Data type '{sheet_data['Question type']}' not found in row {row_num}")

        file_type= val_or_null(sheet_data, "File type")
        if data_type_name.lower() in ('image', 'file upload') and not file_type:
            return ResponseSchema(status=False, details=f"File type is required for data type '{data_type_name}'")
        if file_type and data_type_name.lower() in ('image', 'file upload'):
            file_ids=[]
            for i in file_type.split(','):
                if not file_types.get(i.lower().strip()):
                    return ResponseSchema(status=False, details=f"File type '{i}' not found")
                file_ids.append(file_types[i.lower().strip()])
            file_type= file_ids
        else:
            file_type= None
        
        # validate options
        options= val_or_null(sheet_data, "Options")

        if data_type_name.lower() in ('single choice', 'multiple choice') and not options:
            return ResponseSchema(status=False, details=f"Options are required for data type '{data_type_name}'")
        if options and data_type_name.lower() in ('single choice', 'multi choice'):
            options= options.split(',')
            options= tuple(i.strip() for i in options if i.strip())
        else:
            options= None
        # setup default values
        if data_type_name.lower()  == 'text' and not val_or_null(sheet_data, "Character length") :
            sheet_data['Character length'] = 50
        elif data_type_name.lower()  == 'number' and not val_or_null(sheet_data, "Allow decimal"):
            sheet_data['Allow decimal']= False
        elif data_type_name.lower()  == 'date' and not val_or_null(sheet_data, "Date format"):
            sheet_data['Date format']= "DD/MM/YYYY"
        elif data_type_name.lower()  == 'time' and not val_or_null(sheet_data, "is_24_format"):
            sheet_data['is_24_format']= False
        elif data_type_name.lower() == 'image' and not val_or_null(sheet_data, "Max file size"):
            sheet_data['Max file size']= 5 #mb
        elif data_type_name.lower() == 'file upload' and not val_or_null(sheet_data, "Max file size"):
            sheet_data['Max file size']= 2 #mb


        question_data={
            "data_type_id": data_types.get(data_type_name.lower()),
            "name": sheet_data['Question name'],
            "placeholder": sheet_data['Placeholder'],
            "required": bool(sheet_data['Required']),
            "regex": val_or_null(sheet_data, "Regex"),
            "regex_error_msg": val_or_null(sheet_data, "Regex error"),
            "max_length": val_or_null(sheet_data, "Character length"),
            "allow_decimal": val_or_null(sheet_data, "Allow decimal"),
            "max_file_size": val_or_null(sheet_data, "Max file size"),
            "allow_past_date": val_or_null(sheet_data, "Allow past date"),
            "allow_future_date": val_or_null(sheet_data, "Allow future date"),
            "time_format_24": val_or_null(sheet_data, "is_24_format"),
            "date_format": val_or_null(sheet_data, "Date format"),
            "file_type_ids": file_type,
            "order": sheet_data['Question order'],
            "options": options
        }
        if exist:
            exist["category_financial_due_map"]= category_due_data
            exist_q= next((i for i in exist['questions'] if {"data_type_id": question_data['data_type_id'], "name": question_data['name']} == {"data_type_id": i['data_type_id'], "name": i['name']}), None)
            if not exist_q:
                exist['questions'].append(question_data)
        else:
            category_data["category_financial_due_map"]= category_due_data
            category_data['questions']= [question_data]
            Validated_data.append(category_data)
    new_ids = []
    # insert data into DB - Category, category form and category financial due
    for category in Validated_data:
        # Check if category already exists
        if db.query(Category).filter(Category.name == category['name'], Category.type == category['type'], Category.province_id == category['province_id'], Category.active == True).first():
            return ResponseSchema(status=False, details=f"Category '{category_data['name']}' already exists")
        try:
            # Create category entry
            new_category = Category( name=category['name'], type=category['type'], is_renewal=category['is_renewal'],
                renewal_iteration=category['renewal_iteration'], is_due=category['is_due'], description=category['description'],
                created_by= curr_user.user_id, updated_by= curr_user.user_id, province_id= category['province_id']
            )
            db.add(new_category)
            # db.commit()
            db.flush() 
            # db.refresh(new_category)
            new_ids.append(new_category.id)

            # Create category financial due map entry
            if category['category_financial_due_map']:
                    # Create financial due mapping
                new_due_map = CategoryFinancialDueMap(
                    category_id=new_category.id,
                    financial_year_id=category['category_financial_due_map']['financial_year_id'],
                    due_day=category['category_financial_due_map']['due_day'],
                    due_month=category['category_financial_due_map']['due_month'],
                    created_by= curr_user.user_id,
                    updated_by= curr_user.user_id
                )
                db.add(new_due_map)
                # db.commit()
                # get last order
            
            last_order= db.query(CategoryForm.order).filter(CategoryForm.category_id == new_category.id, CategoryForm.active == True).order_by(CategoryForm.order.desc()).first()
            if not last_order:
                last_order= 1
            else:
                last_order = last_order.order + 1
            for question in category['questions']:
                question['category_id'] = new_category.id
                file_type_ids= question['file_type_ids']
                options= question['options']
                del question['file_type_ids'], question['options']
                new_category_form = CategoryForm(**question, created_by= curr_user.user_id, updated_by= curr_user.user_id)
                db.add(new_category_form)
                # db.commit()
                db.flush()
                # db.refresh(new_category_form)

                # Create category form options
                if options:
                    last_option_order= db.query(CategoryFormOptions.order).filter(CategoryFormOptions.category_form_id == new_category_form.id).order_by(CategoryFormOptions.order.desc()).first()
                    if not last_option_order:
                        last_option_order= 0 #initial 0
                    else:
                        last_option_order = last_option_order.order
                    for i in options:
                        last_option_order = last_option_order + 1
                        new_category_form_option= CategoryFormOptions(category_form_id= new_category_form.id, value= i, default_select= False, order= last_option_order, created_by= curr_user.user_id, updated_by= curr_user.user_id)
                        db.add(new_category_form_option)
                        # db.commit()

                # Create category form file type map
                if file_type_ids:
                    for i in file_type_ids:
                        new_category_form_file_type_map = CategoryFormFileTypeMap(category_form_id= new_category_form.id, file_type_id= i, created_by= curr_user.user_id, updated_by= curr_user.user_id)
                        db.add(new_category_form_file_type_map)
                        # db.commit()

            # mapping
            if category['portfolio']:
                for i in category['portfolio']:
                    if not i: continue
                    new_category_portfolio = PortfolioCategoryMap(category_id= new_category.id, portfolio_id= i, created_by= curr_user.user_id, updated_by= curr_user.user_id)
                    db.add(new_category_portfolio)
                    # db.commit()

        except SQLAlchemyError as e:
            db.rollback()  # Just in case you're not using `with db.begin()`
            return {"status": False, "message": f"Insert failed: {str(e)}"}
        except Exception as err:
            db.query(Category).filter(Category.id.in_(new_ids)).delete(synchronize_session=False)
            db.commit()
            return {"status": False, "details": f"Error in adding category {category['name']}: {str(err)}"}
    db.commit()
    return ResponseSchema(status=True, details="Category imported successfully")

# Add Category
@router.post('/', response_model=ResponseSchema)
async def add_category(category_data: CategorySchema, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    # Conditional validation: type is required only if is_renewal is True
    if category_data.is_renewal:
        if not category_data.type:
            return ResponseSchema(status=False, details="Category type is required for renewal category")
        if not category_data.renewal_iteration:
            return ResponseSchema(status=False, details="Renewal iteration is required for renewal category")
    else:
        if category_data.type is not None:
            return ResponseSchema(status=False, details="Category type must be null for non-renewal category")
        if category_data.renewal_iteration is not None:
            return ResponseSchema(status=False, details="Renewal iteration must be null for non-renewal category")
    # Check if category already exists
    
    if db.query(Category).filter(Category.name == category_data.name, Category.type == category_data.type, Category.province_id == curr_user.province_id, Category.active == True).first():
        return ResponseSchema(status=False, details=f"Category '{category_data.name}' already exists")

    # Create category entry
    new_category = Category( name=category_data.name, type=category_data.type, is_renewal=category_data.is_renewal,
        renewal_iteration=category_data.renewal_iteration, is_due=category_data.is_due, description=category_data.description,
        created_by= curr_user.user_id, updated_by= curr_user.user_id, province_id= curr_user.province_id
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    # Get current financial year
    # financial_year_format= get_curr_financial_year()
    # # Fetch financial year ID from the database
    # financial_year = db.query(FinancialYear).filter(FinancialYear.year == financial_year_format).first()
    # if not financial_year:
    #     return ResponseSchema(status=False, details=f"Financial year '{financial_year_format}' not found in database")
    for i in category_data.category_financial_due_map:
        if not i.due_day or not i.due_month:
            db.query(Category).filter(Category.id == new_category.id).delete(synchronize_session= False)
            return ResponseSchema(status=False, details="Due day and month are required for due categories")
        try:
            # Create financial due mapping
            new_due_map = CategoryFinancialDueMap(
                category_id=new_category.id,
                financial_year_id=i.financial_year_id,
                due_day=i.due_day,
                due_month=i.due_month,
                created_by= curr_user.user_id,
                updated_by= curr_user.user_id
            )
            db.add(new_due_map)
            db.commit()
        except Exception as e:
            db.query(Category).filter(Category.id == new_category.id).delete(synchronize_session= False)
            db.commit()
            return ResponseSchema(status=False, details="Error creating financial due mapping")

    return {"status": True, "details": "Category added successfully" , "data": new_category}

# Get Categories
@router.get('/', response_model=ResponseSchema)
async def get_category(skip: int = 0, limit: int = limit_count, search: str = None, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    
    category = db.query(Category).filter(Category.active == True, Category.province_id == curr_user.province_id).order_by(Category.id.desc())
    if curr_user.role_id == secret.s_admin_role:
        category = db.query(Category).filter(Category.active == True).order_by(Category.id.desc())
    if search:
        category = category.filter(func.lower(Category.name).contains(search.lower()))

    total_count = category.count()

    if limit != 0:
        category = category.offset(skip).limit(limit)
    data = category.all()

    return { "status": True,"details":"Categories fetched successfully","data": data, "total_count": total_count }

# get category by id
@router.get('/{id}', response_model=CategoryResponse)
def get_category_by_id(id:int, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    category= db.query(Category).filter(Category.id== id, Category.province_id == curr_user.province_id, Category.active == True).first()
    if not category:
        return CategoryResponse(status=False, details="Category not found")
    return {"status": True, "details":"Category fetched successfully", "data": category }

# create a question against a category
@router.post('/form/{category_id}')
async def add_category_form(category_id: int, category_form: CategoryFormSchema, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    category_form_options= category_form.category_form_options
    category_form_file_type_map= category_form.category_form_file_type_map
    del category_form.category_form_options, category_form.category_form_file_type_map, category_form.id
    if not db.query(Category.id).filter(Category.id == category_id, Category.province_id == curr_user.province_id, Category.active == True).first():
        return {"status":False, "details":"Category not found"}
    data_type= db.query(DataTypes).filter(DataTypes.id == category_form.data_type_id).first()
    if not data_type:
        return {"status":False, "details":"Data type not found"}
    if data_type.name.lower() == 'text' and not category_form.max_length :
        category_form.max_length = 50
    elif data_type.name.lower() == 'number' and not category_form.allow_decimal:
        category_form.allow_decimal= False
    elif data_type.name.lower() == 'date' and not category_form.date_format:
        category_form.date_format = "DD/MM/YYYY"
    elif data_type.name.lower() == 'time' and not category_form.time_format_24:
        category_form.time_format_24= False
    elif data_type.name.lower() in 'image' and not category_form.max_file_size:
        category_form.max_file_size= 5 #mb
    elif data_type.name.lower() == 'file upload' and not category_form.max_file_size:
        category_form.max_file_size= 2 #mb


    # get last order
    last_order= db.query(CategoryForm.order).filter(CategoryForm.category_id == category_id, CategoryForm.active == True).order_by(CategoryForm.order.desc()).first()
    if not last_order:
        category_form.order= 1
    else:
       category_form.order = last_order.order + 1

    category_form.category_id = category_id
    new_category_form = CategoryForm(**category_form.model_dump(), created_by= curr_user.user_id, updated_by= curr_user.user_id)
    db.add(new_category_form)
    db.commit()
    db.refresh(new_category_form)

    # Create category form options
    last_option_order= db.query(CategoryFormOptions.order).filter(CategoryFormOptions.category_form_id == new_category_form.id).order_by(CategoryFormOptions.order.desc()).first()
    if not last_option_order:
        last_option_order= 0 #initial 0
    else:
        last_option_order = last_option_order.order
    for i in category_form_options:
        last_option_order = last_option_order + 1
        new_category_form_option= CategoryFormOptions(category_form_id= new_category_form.id, value= i.value, default_select= i.default_select, order= last_option_order, created_by= curr_user.user_id, updated_by= curr_user.user_id)
        db.add(new_category_form_option)
        db.commit()

    # Create category form file type map
    for i in category_form_file_type_map:
        new_category_form_file_type_map = CategoryFormFileTypeMap(category_form_id= new_category_form.id, file_type_id= i.file_type_id, created_by= curr_user.user_id, updated_by= curr_user.user_id)
        db.add(new_category_form_file_type_map)
        db.commit()

    return {"status":True, "details":"Question added successfully"}

# get form by category id
@router.get('/form/{category_id}', response_model=ResponseSchema)
async def get_category_form(category_id: int, db: Session = Depends(get_db), curr_user=Depends(authenticate)):
    query = db.query(CategoryForm).filter(CategoryForm.category_id == category_id, CategoryForm.active == True).order_by(CategoryForm.order.asc())
    if not query.first():
        return ResponseSchema(status=False, details="Category not found")
    return {"status":True, "details":"Category form fetched successfully","total_count": query.count(), "data": query.all()}

# update category forms list
@router.put('/form')
async def update_category_form(category_form: CategoryUpdateFormSchema, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    category_form_data= db.query(CategoryForm).filter(CategoryForm.id == category_form.id).first()
    if not category_form_data:
        return ResponseSchema(status=False, details="Category form not found")
    if not db.query(DataTypes.id).filter(DataTypes.id == category_form.data_type_id).first():
        del category_form.data_type_id
    category_form_options= category_form.category_form_options
    category_form_file_type_map= category_form.category_form_file_type_map
    del category_form.category_form_options, category_form.category_form_file_type_map

    for key, value in category_form.model_dump().items():
        if value is not None:
            setattr(category_form_data, key, value)
    category_form_data.updated_by= curr_user.user_id
    # category_form_data.update(category_form.model_dump(), synchronize_session= False)
    db.commit()

    # Create and update category form options
    for options in category_form_options:
        if options.id:
            category_options= db.query(CategoryFormOptions).filter(CategoryFormOptions.id == options.id ).first()
            if not category_options:
                return ResponseSchema(status=False, details="Category form option not found")
            # update existing options
            for key, value in options.model_dump().items():
                if value is not None:
                    setattr(category_options, key, value)
            category_options.updated_by= curr_user.user_id
            db.commit()
        else:
            # get & set order if not received order
            last_option_order= db.query(CategoryFormOptions.order).filter(CategoryFormOptions.category_form_id == category_form.id).order_by(CategoryFormOptions.order.desc()).first()
            if not last_option_order:
                last_option_order= 0
            else:
                last_option_order= last_option_order.order
            if not options.order:
                options.order = last_option_order + 1
            new_category_form_option= CategoryFormOptions(category_form_id= category_form.id, value= options.value, default_select= options.default_select, order= options.order, created_by= curr_user.user_id, updated_by= curr_user.user_id)
            db.add(new_category_form_option)
            db.commit()

    map_id= []
    new_type=[]
    exist_file_type= db.query(CategoryFormFileTypeMap).filter(CategoryFormFileTypeMap.category_form_id == category_form.id).all()
    for file_type in category_form_file_type_map:
        check_type= list(filter(lambda x: x.file_type_id == file_type.file_type_id, exist_file_type))
        if len(check_type) > 0:
            map_id.append(check_type[0].id)
        else :
            if file_type.file_type_id:
                new_type.append(CategoryFormFileTypeMap(category_form_id= category_form.id, file_type_id= file_type.file_type_id, created_by= curr_user.user_id, updated_by= curr_user.user_id))

    # Delete old map if get new map
    if map_id:
        delete_old_map= db.query(CategoryFormFileTypeMap).filter(CategoryFormFileTypeMap.category_form_id == category_form.id, CategoryFormFileTypeMap.id.notin_(map_id))
        delete_old_map.delete(synchronize_session= False)
        db.commit()

    # add new user legal entity map
    if new_type:
        db.add_all(new_type)
    db.commit()

    return ResponseSchema(status=True, details="Category form updated successfully")

# update order
@router.put('/order')
async def update_category_form_order(category_form_order: CategoryFormOrderSchema, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    for i in category_form_order.order:
        category_form_data= db.query(CategoryForm).filter(CategoryForm.id == i.id).first()
        if not category_form_data:
            return ResponseSchema(status=False, details="Category form not found")
        category_form_data.order= i.order
        category_form_data.updated_by= curr_user.user_id
        db.commit()
    return ResponseSchema(status=True, details="Category form order updated successfully")    

# delete options
@router.delete('/options/{id}')
async def delete_category_options(id: int, db: Session = Depends(get_db), curr_user=Depends(authenticate)):
    category_options_data= db.query(CategoryFormOptions).filter(CategoryFormOptions.id == id)
    if not category_options_data.first():
        return ResponseSchema(status=False, details="Category form option not found")
    category_options_data.delete(synchronize_session=False)
    db.commit()
    return ResponseSchema(status=True, details="Category form option deleted successfully")

# update category 
@router.put('/{id}', response_model=ResponseSchema)
async def update_category(id: int, category_data: CategorySchema, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    category = db.query(Category).filter(Category.id == id, Category.province_id == curr_user.province_id, Category.active == True).first()
    if not category:
        return ResponseSchema(status=False, details="Category not found")

    # Check if category name & type already exists (excluding current ID)
    existing_category = db.query(Category).filter(Category.name == category_data.name, Category.type == category_data.type, Category.province_id == curr_user.province_id, Category.active == True, Category.id != id).first()
    if existing_category:
        return ResponseSchema(status=False, details=f"Category '{category_data.name}' already exists")

    # Update category details
    category.name = category_data.name
    category.type = category_data.type
    category.is_renewal = category_data.is_renewal
    category.renewal_iteration = category_data.renewal_iteration
    category.is_due = category_data.is_due
    category.description = category_data.description
    category.updated_by = curr_user.user_id
    db.commit()

    for i in category_data.category_financial_due_map:
        if not i.due_day or not i.due_month:
            return ResponseSchema(status=False, details="Due day and month are required for due categories")

        # Fetch financial due data
        due_map = db.query(CategoryFinancialDueMap).filter(CategoryFinancialDueMap.category_id == id, CategoryFinancialDueMap.financial_year_id == i.financial_year_id).first()

        if due_map:
            due_map.due_day = i.due_day
            due_map.due_month = i.due_month
            due_map.updated_by = curr_user.user_id
        else:
        # # If no due mapping exists, create a new one
        # current_year = datetime.today().year
        # start_year = current_year if datetime.today().month >= 4 else current_year - 1
        # end_year = start_year + 1
        # financial_year_format = f"{start_year}-{end_year}"

        # financial_year = db.query(FinancialYear).filter(FinancialYear.year == financial_year_format).first()
        # if not financial_year:
        #     return ResponseSchema(status=False, details=f"Financial year '{financial_year_format}' not found in database")

            new_due_map = CategoryFinancialDueMap( category_id=id,  financial_year_id=i.financial_year_id,  due_day=i.due_day,
                due_month=i.due_month, created_by= curr_user.user_id, updated_by= curr_user.user_id
            )
            db.add(new_due_map)

    db.commit()
    return ResponseSchema(status=True, details="Category updated successfully")

# delete category question by id
@router.delete('/form', response_model=ResponseSchema)
async def delete_category_form(form_ids: str, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    try:
        form_ids_array= list(map(int, form_ids.split(',')))
    except Exception as e:
        return ResponseSchema(status=False, details="Invalid form ids")
    for id in form_ids_array:
        category_form_data= db.query(CategoryForm).filter(CategoryForm.id == id)
        if not category_form_data.first():
            return ResponseSchema(status=False, details="Category form not found")
        # category_form_data.delete(synchronize_session= False)
        category_form_data.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session= False)
        db.commit()
    return ResponseSchema(status=True, details="Category forms deleted successfully")

# delete category
@router.delete('/{id}', response_model=ResponseSchema)
async def delete_category(id: int, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    category = db.query(Category).filter(Category.id == id, Category.province_id == curr_user.province_id, Category.active == True)
    if not category.first():
        return ResponseSchema(status=False, details="Category not found")
    
    # check an answer exists
    # answers= db.query(Answer).filter(Answer.category_id == id).all()
    # if answers:
    #     for answer in answers:
    #         if db.query(AnswerData).filter(AnswerData.answer_id == answer.id).first():
    #             module_name = ''
    #             if answer.community or answer.cfp:
    #                 module_name = "community"
    #             elif answer.society or answer.sfp:
    #                 module_name = "society"
    #             elif answer.legal_entity:
    #                 module_name = answer.legal_entity.portfolio.name
    #             elif answer.lefp:
    #                 module_name = answer.lefp.legal_entity.portfolio.name
    #             return ResponseSchema(status=False, details="Category has answers in -" + module_name)
    
    # change status of answers
    answer_data= db.query(AnswerData).filter(AnswerData.answer_id.in_(db.query(Answer.id).filter(Answer.category_id == id).scalar_subquery()))
    if answer_data.first():
        answer_data.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)

    # change status of  financial due mapping
    cate_fin_map= db.query(CategoryFinancialDueMap).filter(CategoryFinancialDueMap.category_id == id)
    if cate_fin_map.first():
        cate_fin_map.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)

    # change status of  questions
    category_form_data= db.query(CategoryForm).filter(CategoryForm.category_id == id)
    if category_form_data.first():
        category_form_data.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)

    # change status of  mapp
    portfolio_mapp= db.query(PortfolioCategoryMap).filter(PortfolioCategoryMap.category_id == id)
    if portfolio_mapp.first():
        portfolio_mapp.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)
    # db.query(PortfolioCategoryMap).filter(PortfolioCategoryMap.category_id == id).delete(synchronize_session=False)

    # change status of  category
    # db.delete(category)
    category.update({"active": False, "updated_by": curr_user.user_id}, synchronize_session=False)
    db.commit()

    return ResponseSchema(status=True, details="Category deleted successfully")