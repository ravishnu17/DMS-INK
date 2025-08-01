from fastapi import APIRouter, Depends, Form, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from models.access_control import User
from models.configuration import Portfolio, Community, Society, LegalEntity, CFP, SFP, LEFP
from models.category import FinancialYear, Category, CategoryForm, PortfolioCategoryMap
from models.answers import Answer, AnswerData
from schemas.answers import ResponseSchema, AnswerResponse
from schemas.access_control import Token
from settings.db import get_db
from settings.auth import authenticate, genToken, verify_file_token
from settings.config import secret
from constants.constant import limit_count, root_path, file_location, alter_filename
import json, os, shutil
from datetime import date

root_file_path= os.path.join(root_path, 'files')

router = APIRouter(
    prefix='/answers', 
    tags=['answers']
)

# validate and return data to add
def add_answer(db:Session, category_id:int, financial_id:int, version:int, entity_name, curr_user:Token, answer_data:str, file:List[UploadFile]=None):
    category= db.query(Category).filter(Category.id == category_id, Category.province_id == curr_user.province_id, Category.active == True).first()
    if not category:
        raise ValueError("Category not found")
    
    financial_year= db.query(FinancialYear).filter(FinancialYear.id == financial_id).first()
    if not financial_year:
        raise ValueError("Financial year not found")
    
    try:
        answers= json.loads(answer_data)
    except:
        raise ValueError("Invalid answer data")
    
    questions= db.query(CategoryForm).filter(CategoryForm.category_id == category_id, CategoryForm.active == True).all()
    if not questions:
        raise ValueError("Questions not found")

    for question in questions:
        answers[str(question.id)]= answers.get(str(question.id)) if answers.get(str(question.id)) else {}
        if question.data_type.name.lower() == 'text':
            if question.required and not answers.get(str(question.id)):
                raise ValueError("Text answer required")
            answers[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}
        
        if question.data_type.name.lower() == 'number':
            if question.required and not answers.get(str(question.id)):
                raise ValueError("Number answer required")
            answers[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}
        
        if question.data_type.name.lower() == 'date':
            if question.required and not answers.get(str(question.id)):
                raise ValueError("Date answer required")
            answers[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}
        
        if question.data_type.name.lower() == 'time':
            if question.required and not answers.get(str(question.id)):
                raise ValueError("Time answer required")
            answers[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}
        
        if question.data_type.name.lower() == 'single choice':
            if question.required and not answers.get(str(question.id)):
                raise ValueError("Single choice answer required")
            answers[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}
        
        if question.data_type.name.lower() == 'multi choice':
            if question.required and not answers.get(str(question.id)):
                raise ValueError("Multi choice answer required")
            answers[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}
        
        if question.data_type.name.lower() == 'image':
            if question.required and (not answers.get(str(question.id)) or not file):
                raise ValueError("Image answer required")
            if not answers.get(str(question.id)):
                answers[str(question.id)]= []
                continue
            img_file= list(filter(lambda x: x.filename == answers[str(question.id)].get('file_name'), file))
            if len(img_file) == 0:
                raise ValueError("Image file not found")
            img_path= file_location(entity_name, category.name, financial_year.year, question.name)
            if answers[str(question.id)]['file_extension'].lower() not in list(map(lambda x: x.file_type.name.lower(), question.category_form_file_type_map)):
                raise ValueError("Invalid image file type")
            try:
                filename= alter_filename(img_file[0].filename, f"{version}_file_version_1")
                os.makedirs(os.path.join(root_file_path, img_path), exist_ok=True)
                with open(os.path.join(root_file_path,img_path, filename), 'wb') as buffer:
                    shutil.copyfileobj(img_file[0].file, buffer)
                # files store as array because add time one file and update time another file, don't remove previous file
                answers[str(question.id)] = [{"file_name":filename, "version":1, "file_extension": answers[str(question.id)]['file_extension'].lower(), "file_location": os.path.join(img_path, filename), "file_size": img_file[0].size, "question_name":question.name, "question_type":question.data_type.name}]
            except Exception as e:
                print("Exception: image -- ", e)
                raise ValueError("Failed to save image file")
        
        if question.data_type.name.lower() == 'file upload':
            if question.required and (not answers.get(str(question.id)) or not file):
                raise ValueError("File upload answer required")
            if not answers.get(str(question.id)):
                answers[str(question.id)]= []
                continue
            upload_file= list(filter(lambda x: x.filename == answers[str(question.id)].get('file_name'), file))
            if len(upload_file) == 0:
                raise ValueError("File not found")
            upload_path= file_location(entity_name, category.name, financial_year.year, question.name)
            if answers[str(question.id)]['file_extension'].lower() not in list(map(lambda x: x.file_type.name.lower(), question.category_form_file_type_map)):
                raise ValueError("Invalid file type")
            try:
                filename= alter_filename(upload_file[0].filename, f"{version}_file_version_1")
                os.makedirs(os.path.join(root_file_path, upload_path), exist_ok=True)
                with open(os.path.join(root_file_path,upload_path, filename), 'wb') as buffer:
                    shutil.copyfileobj(upload_file[0].file, buffer)
                answers[str(question.id)] = [{"file_name":filename, "version":1, "file_extension": answers[str(question.id)]['file_extension'].lower(), "file_location": os.path.join(upload_path, filename), "file_size": upload_file[0].size, "question_name":question.name, "question_type":question.data_type.name}]
            except Exception as e:
                print("Exception: file upload -- ", e)
                raise ValueError("Failed to save uploaded file")
    return answers

# file version to maintain in update
def file_version(ex_ans_version, old_length):
    ans_version= str(ex_ans_version) + '_file_version_'
    if old_length == 0:
        ans_version= ans_version + '1'
    else:
        ans_version= ans_version + str(old_length + 1)
    return ans_version

# update answer
def update_answer_data(db:Session, entity_name, entity_answer, financial_year, ex_ans_version, old_ans, answer_data:str, file: List[UploadFile] = None):
    category= entity_answer.category

    try:
        answers= json.loads(answer_data)
    except:
        raise ValueError("Invalid answer data")
    
    questions= db.query(CategoryForm).filter(CategoryForm.category_id == entity_answer.category_id, CategoryForm.active == True).all()
    if not questions:
        raise ValueError("Questions not found")

    for question in questions:
        answers[str(question.id)]= answers.get(str(question.id)) if answers.get(str(question.id)) else {}
        if question.data_type.name.lower() == 'text':
            if answers.get(str(question.id)):
                old_ans[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}
        
        if question.data_type.name.lower() == 'number':
            if answers.get(str(question.id)):
                old_ans[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}
        
        if question.data_type.name.lower() == 'date':
            if answers.get(str(question.id)):
                old_ans[str(question.id)]=  {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}

        if question.data_type.name.lower() == 'time':
            if answers.get(str(question.id)):
                old_ans[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}

        if question.data_type.name.lower() == 'single choice':
            if answers.get(str(question.id)):
                old_ans[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}

        if question.data_type.name.lower() == 'multi choice':
            if answers.get(str(question.id)):
                old_ans[str(question.id)]= {**answers.get(str(question.id)), "question_name":question.name, "question_type":question.data_type.name}

        if question.data_type.name.lower() == 'image':
            if answers.get(str(question.id)):
                old_ans[str(question.id)]= old_ans.get(str(question.id), [])
                check_exist= filter(lambda x: x.get('file_name') == answers[str(question.id)].get('file_name'), old_ans[str(question.id)])
                if len(list(check_exist)) > 0:
                    continue
                img_file= list(filter(lambda x: x.filename == answers[str(question.id)].get('file_name'), file))
                if len(img_file) == 0:
                    raise ValueError("Specified image file not found")

                img_path= file_location(entity_name, category.name, financial_year.year, question.name)
                if answers[str(question.id)]['file_extension'].lower() not in list(map(lambda x: x.file_type.name.lower(), question.category_form_file_type_map)):
                    raise ValueError("Invalid image file type")
                try:
                    filename= alter_filename(img_file[0].filename, file_version(ex_ans_version, len(old_ans[str(question.id)])))

                    os.makedirs(os.path.join(root_file_path, img_path), exist_ok=True)
                    with open(os.path.join(root_file_path,img_path, filename), 'wb') as buffer:
                        shutil.copyfileobj(img_file[0].file, buffer)
                    ans= {"file_name":filename, "version": len(old_ans[str(question.id)]) + 1, "file_extension": answers[str(question.id)]['file_extension'].lower(), "file_location": os.path.join(img_path, filename), "file_size": img_file[0].size, "question_name":question.name, "question_type":question.data_type.name}
                    old_ans[str(question.id)].append(ans)
                except Exception as e:
                    print("error", e)
                    raise ValueError("Failed to save image file")
        if question.data_type.name.lower() == 'file upload':
            if answers.get(str(question.id)):
                old_ans[str(question.id)]= old_ans.get(str(question.id), [])
                # check same file
                check_exist= filter(lambda x: x.get('file_name') == answers[str(question.id)].get('file_name'), old_ans[str(question.id)])
                if len(list(check_exist)) > 0:
                    continue
                upload_file= list(filter(lambda x: x.filename == answers[str(question.id)].get('file_name'), file))
                if len(upload_file) == 0:
                    raise ValueError("Specified file not found")

                upload_path= file_location(entity_name, category.name, financial_year.year, question.name)
                if answers[str(question.id)]['file_extension'].lower() not in list(map(lambda x: x.file_type.name.lower(), question.category_form_file_type_map)):
                    raise ValueError("Invalid file type")
                try:
                    filename= alter_filename(upload_file[0].filename, file_version(ex_ans_version, len(old_ans[str(question.id)])))

                    os.makedirs(os.path.join(root_file_path, upload_path), exist_ok=True)
                    with open(os.path.join(root_file_path,upload_path, filename), 'wb') as buffer:
                        shutil.copyfileobj(upload_file[0].file, buffer)
                    ans= {"file_name":filename, "version": len(old_ans[str(question.id)]) + 1, "file_extension": answers[str(question.id)]['file_extension'].lower(), "file_location": os.path.join(upload_path, filename), "file_size": upload_file[0].size, "question_name":question.name, "question_type":question.data_type.name}
                    old_ans[str(question.id)].append(ans)
                except Exception as e:
                    print(e)
                    raise ValueError("Failed to save uploaded file")
    # values updated with old object
    return old_ans

# delete answer file
def delete_file(answer_data):
    for question in answer_data.answer_data.keys():
        if type(answer_data.answer_data[question]) == list:
            for ans in answer_data.answer_data[question]:
                if ans.get('file_location'):
                    file_path= os.path.join(root_file_path, ans.get('file_location'))
                    if os.path.exists(file_path):
                        os.remove(file_path)
        else:
            if answer_data.answer_data[question].get('file_location'):
                file_path= os.path.join(root_file_path, answer_data.answer_data[question].get('file_location'))
                if os.path.exists(file_path):
                    os.remove(file_path)

# filter and get exact entity
def get_entity_data(db:Session, portfolio, entity_id, financial_entity_id):
    # add filter based on entity
    exist_query= db.query(Answer).filter(Answer.active == True)
    new_obj= Answer() # add value to create new data
    if portfolio.name.lower() == 'community':
        if financial_entity_id:
            entity_data= db.query(CFP).filter(CFP.id == financial_entity_id).first()
            exist_query= exist_query.filter(Answer.cfp_id == financial_entity_id)
            new_obj.cfp_id= financial_entity_id
        else:
            entity_data= db.query(Community).filter(Community.id == entity_id).first()
            exist_query= exist_query.filter(Answer.community_id == entity_id)
            new_obj.community_id= entity_id
    elif portfolio.name.lower() == 'society':
        if financial_entity_id:
            entity_data= db.query(SFP).filter(SFP.id == financial_entity_id).first()
            exist_query= exist_query.filter(Answer.sfp_id == financial_entity_id)
            new_obj.sfp_id= financial_entity_id
        else:
            entity_data= db.query(Society).filter(Society.id == entity_id).first()
            exist_query= exist_query.filter(Answer.society_id == entity_id)
            new_obj.society_id= entity_id
    else: # legal entity
        if financial_entity_id:
            entity_data= db.query(LEFP).filter(LEFP.id == financial_entity_id).first()
            exist_query= exist_query.filter(Answer.lefp_id == financial_entity_id)
            new_obj.lefp_id= financial_entity_id
        else:
            entity_data= db.query(LegalEntity).filter(LegalEntity.id == entity_id).first()
            exist_query= exist_query.filter(Answer.legal_entity_id == entity_id)
            new_obj.legal_entity_id= entity_id
    return (entity_data, exist_query, new_obj) # 1. portfolio entity data ex: community, CFP 2. Answer table filter query, 3.new obj to create data
       

#  ----------------------  Answer APIs  ----------------------
@router.post("/", response_model=ResponseSchema)
def answer(non_financial_portfolio_id:int, entity_id:int, category_id:int, financial_year_id:int, start_date:date= None, end_date:date= None, financial_entity_id:int= None, answer_data:str= Form(...), file: List[UploadFile] | None = None, db: Session = Depends(get_db), curr_user:Token=Depends(authenticate)):
    # get non financial portfolio
    portfolio= db.query(Portfolio).filter(Portfolio.id == non_financial_portfolio_id, func.lower(Portfolio.type) == 'non financial').first()
    if not portfolio:
        return ResponseSchema(status=False, details="Portfolio not found")
    category_data= db.query(Category).filter(Category.id == category_id, Category.active == True).first()
    if not category_data:
        return ResponseSchema(status=False, details="Category not found")
    if category_data.is_renewal:
        if not start_date or not end_date:
            return ResponseSchema(status=False, details="Start date and end date are required for renewal answers")
        if end_date < start_date:
            return ResponseSchema(status=False, details="End date should be greater than start date")

    entity_data, exist_query, new_obj= get_entity_data(db, portfolio, entity_id, financial_entity_id)
    if not entity_data:
        return ResponseSchema(status=False, details="Data not found")
    # check answer for particular portfolio category
    exist= exist_query.filter(Answer.category_id == category_id).first()
    id= None
    if exist:
       id= exist.id
    # check document already uploaded for particular year and month
    check= db.query(AnswerData).filter(AnswerData.answer_id == id, AnswerData.financial_year == financial_year_id, AnswerData.active == True)
    if start_date and end_date:
        check= check.filter(AnswerData.start_date == start_date, AnswerData.end_date == end_date)
    if check.first():
        return ResponseSchema(status=False, details=f"Answer already saved for this financial year {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}" if start_date else "Answer already saved for this financial year")

    # get version
    get_last_version= db.query(AnswerData.version).filter(AnswerData.answer_id == id, AnswerData.active == True).order_by(AnswerData.version.desc()).first()
    version= 1
    if get_last_version:
        version= get_last_version.version+1
    
    try:
        answers= add_answer(db, category_id, financial_year_id, version, entity_data.name, curr_user, answer_data, file)
    except ValueError as e:
        return ResponseSchema(status=False, details=e.__str__())
    except Exception as e:
        return ResponseSchema(status=False, details=e.__str__())

    if not id:
        new_obj.category_id, new_obj.created_by, new_obj.updated_by = category_id, curr_user.user_id, curr_user.user_id
        db.add(new_obj)
        db.commit()
        db.refresh(new_obj)
        id= new_obj.id

    db.add(AnswerData(answer_id= id, version= version,financial_year= financial_year_id, start_date= start_date, end_date= end_date , answer_data= answers, created_by= curr_user.user_id, updated_by= curr_user.user_id))
    db.commit()
    
    return {"status":True, "details":"Answer stored successfully"}

# get answer list
@router.get("/list", response_model=ResponseSchema)
def answer_list(non_financial_portfolio_id:int, entity_id:int, category_id:int, financial_year_id:int= None, start_date:date= None, end_date:date= None, financial_entity_id:int= None, skip:int=0, limit:int=limit_count, search:str=None, show_deleted:bool=False, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    portfolio= db.query(Portfolio).filter(Portfolio.id == non_financial_portfolio_id, func.lower(Portfolio.type) == 'non financial').first()
    if not portfolio:
        return ResponseSchema(status=False, details="Portfolio not found")
    entity_data, exist_query, new_obj= get_entity_data(db, portfolio, entity_id, financial_entity_id)
    data= exist_query.filter(Answer.category_id == category_id).first()
    if not data:
        return ResponseSchema(status=False, details="Answer not found")
    answer_data= db.query(AnswerData).filter(AnswerData.answer_id == data.id, AnswerData.active == True)
    if financial_year_id:
        answer_data= answer_data.filter(AnswerData.financial_year == financial_year_id)
    if start_date and end_date:
        answer_data= answer_data.filter(AnswerData.start_date <= end_date, AnswerData.end_date >= start_date)
    answer_data= answer_data.order_by(AnswerData.version.desc())
    # check and update user details who is ddm and viewer
    if data.cfp_id:
        data.entity_users= data.cfp.cfp_user
    elif data.community_id:
        data.entity_users= data.community.community_user
    elif data.sfp_id:
        data.entity_users= data.sfp.sfp_user
    elif data.society_id:
        data.entity_users= data.society.society_user
    elif data.lefp_id:
        data.entity_users= data.lefp.lefp_user
    elif data.legal_entity_id:
        data.entity_users= data.legal_entity.entity_user

    if not show_deleted:
        answer_data= answer_data.filter(AnswerData.active == True)
    if search:
        pass
    total_count= answer_data.count()
    if limit != 0:
        ans_data= answer_data.offset(skip).limit(limit).all()
    else:
        ans_data= answer_data.all()
    return {"status":True, "details":"Answer list fetched successfully", "total_count": total_count, 
            "data": {"answer_details": data, "answers": ans_data }
        }


# file response for community, society and legal entity
@router.get("/file")
def get_file(token: str, db:Session= Depends(get_db)):
    data= verify_file_token(token)
    file= None
    if not data:
        return ResponseSchema(status=False, details="Invalid token")
    file= db.query(AnswerData).filter(AnswerData.id == data['id'], AnswerData.active == True).first()
    if not file:
        return ResponseSchema(status=False, details="File module not found")
    
    file_details= file.answer_data[data['q_id']][data['index']]
    if not file_details.get("file_location"):
        return ResponseSchema(status=False, details="File not found")
    file_path= os.path.join(root_file_path, file_details['file_location'])
    media_type= "application/octet-stream"
    if file_details['file_extension'] == "jpg" or file_details['file_extension'] == "jpeg":
        media_type= "image/jpeg"
    elif file_details['file_extension'] == "png":
        media_type= "image/png"
    elif file_details['file_extension'] == "pdf":
        media_type= "application/pdf"
    return FileResponse( file_path, media_type=media_type, headers={"Content-Disposition": f"inline; filename={file_details['file_name']}"} )

# get specific answer by answer_data id
@router.get("/{answer_data_id}", response_model=AnswerResponse)
def answer_by_id(answer_data_id:int, db:Session= Depends(get_db), curr_user:Token= Depends(authenticate)):
    data= db.query(AnswerData).filter(AnswerData.id == answer_data_id, AnswerData.active == True).first()
    
    if not data:
        return ResponseSchema(status=False, details="Answer data not found")
    
    # add created by and updated by
    created_by= db.query(User).filter(User.id == data.created_by).first()
    updated_by= db.query(User).filter(User.id == data.updated_by).first()
    data.created_by= created_by.name
    data.updated_by= updated_by.name
    
    for i in data.answer_data.keys():
        if type(data.answer_data[i]) == list:
            for index,j in enumerate(data.answer_data[i]):
                if j.get('file_location'):
                    j['file_location'] = secret.file_base_url + genToken({"id": answer_data_id, "q_id": i, "index": index})

    return {"status":True, "details":"Answer data fetched successfully", "data": data}

# update answer
@router.put("/{answer_data_id}", response_model=ResponseSchema)
def update_answer(
    answer_data_id: int, 
    answer_data: str = Form(...), 
    file: List[UploadFile] | None = None, 
    start_date: date = None, 
    end_date: date = None, 
    financial_year_id: int = None, 
    db: Session = Depends(get_db), 
    curr_user: Token = Depends(authenticate)
):
    """
    Update answer data by answer_data_id
    """
    start_date= start_date or None
    end_date= end_date or None
    financial_year_id= financial_year_id or None
    if not financial_year_id:
        return ResponseSchema(status=False, details="Financial year is required")
    if financial_year_id:
        financial_year= db.query(FinancialYear).filter(FinancialYear.id == financial_year_id).first()
        if not financial_year:
            return ResponseSchema(status=False, details="Financial year not found")

    # get answer data
    db_object= db.query(AnswerData).filter(AnswerData.id == answer_data_id, AnswerData.active == True)
    exist_answer= db_object.first()
    if not exist_answer:
        return ResponseSchema(status=False, details="Answer data not found")
    
    # db data copy
    old_ans= {**exist_answer.answer_data}
    
    # get answer master data
    answer= db.query(Answer).filter(Answer.id == exist_answer.answer_id).first()
    name= None
    if answer.community:
        name= answer.community.name
    elif answer.cfp:
        name= answer.cfp.name
    elif answer.society:
        name= answer.society.name
    elif answer.sfp:
        name= answer.sfp.name
    elif answer.legal_entity:
        name= answer.legal_entity.name
    elif answer.lefp:
        name= answer.lefp.name

    try:
        # update answer data
        updated_ans= update_answer_data(db, name, answer, exist_answer.financial_year_data , exist_answer.version, old_ans, answer_data, file)
    except ValueError as e:
        return ResponseSchema(status=False, details=e.__str__())
    except Exception as e:
        return ResponseSchema(status=False, details=e.__str__())

    # update answer data
    db_object.update({
        "answer_data": updated_ans,
        "updated_by": curr_user.user_id,
        "start_date": start_date,
        "end_date": end_date,
        "financial_year": financial_year_id
    }, synchronize_session=False)
    db.commit()

    return {"status":True, "details":"Community answer data updated successfully"}

# delete answer by answer data id - temporary
@router.delete('/{answer_data_id}')
async def delete_answer(answer_data_id: int, db: Session = Depends(get_db), curr_user=Depends(authenticate)):
    answer_data = db.query(AnswerData).filter(AnswerData.id == answer_data_id).first()
    if not answer_data:
        return ResponseSchema(status=False, details="Answer data not found")
    answer_data.active= False
    db.commit()
    return ResponseSchema(status=True, details="Answer data deleted successfully")

# delete permanent
# @router.delete('delete/{answer_data_id}')
# async def delete_permanent(answer_data_id: int, db: Session = Depends(get_db), curr_user=Depends(authenticate)):
#     answer_obj = db.query(AnswerData).filter(AnswerData.id == answer_data_id)
#     answer_data= answer_obj.first()
#     if not answer_data:
#         return ResponseSchema(status=False, details="Answer data not found")
    
#     try:
#         delete_file(answer_data)
#     except Exception as e:
#         print(e)
#         return ResponseSchema(status=False, details="Error while deleting answer file")

#     answer_obj.delete(synchronize_session=False)
#     db.commit()
#     return ResponseSchema(status=True, details="Answer data deleted permanently")