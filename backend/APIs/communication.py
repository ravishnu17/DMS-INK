import os
import shutil
from fastapi import APIRouter,Depends
from schemas.communication import CommunicationCreate,CommunicationResponse,CommunicationView,ResponseModel,CommunicationSMS
from sqlalchemy.orm import Session,aliased
from sqlalchemy import or_, cast, String

from settings.db import get_db
from settings.auth import authenticate
from schemas.access_control import Token
from models.access_control import User
from models.communication import Communication, CommunicationToUSers,CommunicationAttachment
from constants.constant import send_email,send_sms
from constants.mail_layout import com_email_html
from typing import List
from fastapi import File, UploadFile, Form
import json
from sqlalchemy.exc import SQLAlchemyError
from settings.config import secret
from constants.constant import limit_count





from typing import Optional


router = APIRouter(
    prefix="/communication",
    tags=["Communication"]
)

root_path = os.getcwd()  # or wherever your base path is
root_file_path = os.path.join(root_path, 'files')

# @router.get("/")
# create communication with mail 
@router.post("/create_communication")
async def create_communication(communication: str = Form(...), files: List[UploadFile] = File(None), db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    try:
        communication_dict = json.loads(communication)
        communication_obj = CommunicationCreate(**communication_dict)

        from_user_id = curr_user.user_id
        subject = communication_obj.subject
        content = communication_obj.content
        type = communication_obj.type
        status = communication_obj.status
        recipients = communication_obj.recipients
        
        if not subject:
            return {"status": False, "details": "Subject is required"}
        if not content:
            return {"status": False, "details": "Content is required"}
        if not type:
            return {"status": False, "details": "Type is required"}
        if not status:
            return {"status": False, "details": "Status is required"}
        if not recipients and status != "DRAFT":
            return {"status": False, "details": "Recipients are required"}
        

        # Start a DB transaction
        with db.begin():
            # Save communication
            comm = Communication(
                province_id=curr_user.province_id if curr_user.province_id else None,
                from_user_id=from_user_id,
                subject=subject,
                content=content,
                type=type,
                status=status
            )
            db.add(comm)
            db.flush()  # To get comm.id before commit

            # Save recipients
            file_paths = []

            for recipient in recipients:
                if 'id' not in recipient or 'email' not in recipient:
                    raise ValueError("Each recipient must have 'id' and 'email'")
                comm_to_user = CommunicationToUSers(
                    communication_id=comm.id,
                    to_user_id=recipient['id']
                )
                db.add(comm_to_user)

            # Save attachments and collect file paths
            if files:
                email_folder = os.path.join(root_file_path, "email", str(comm.id))
                os.makedirs(email_folder, exist_ok=True)

                for idx, file in enumerate(files):
                    content_bytes = await file.read()
                    file_path = os.path.join(email_folder, file.filename)
                    with open(file_path, "wb") as f:
                        f.write(content_bytes)

                    file_paths.append(file_path)

                    attachment = CommunicationAttachment(
                        communication_id=comm.id,
                        file=file_path,
                        file_type=os.path.splitext(file.filename)[1][1:],
                        file_version=idx + 1,
                        file_size=file.size,
                        filename=file.filename
                    )
                    db.add(attachment)

            # Send email if status is SENT
            if status.upper() == "SENT":
                for recipient in recipients:
                    send_email(recipient['email'], subject, html_content=com_email_html('Users',content), plain_text='', file_paths=file_paths)

        return {
            "status": True,
            "details": "Communication created successfully",
            "data": CommunicationResponse(
                id=comm.id,
                from_user_id=from_user_id,
                subject=subject,
                content=content,
                type=type,
                status=status,
                created_at=comm.created_at
            )
        }

    except (ValueError, SQLAlchemyError, Exception) as e:
        db.rollback()  # Roll back any partial changes
        return {"status": False, "details": f"Error: {str(e)}"}
#update communication
@router.put("/communication_update/{comm_id}")
async def update_communication(
    comm_id: int,
    communication: str = Form(...),
    files: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        communication_dict = json.loads(communication)
        communication_obj = CommunicationCreate(**communication_dict)

        with db.begin():
            comm = db.query(Communication).filter_by(id=comm_id).first()
            if not comm:
                return { "status": False, "details": "Communication not found" }

            original_status = comm.status.upper()
            if original_status != "DRAFT":
                return {
                    "status": False,
                    "details": "Communication already sent or scheduled, cannot be updated"
                }

            # Validate fields
            if not communication_obj.subject:
                return { "status": False, "details": "Subject is required" }
            if not communication_obj.content:
                return { "status": False, "details": "Content is required" }
            if not communication_obj.type:
                return { "status": False, "details": "Type is required" }
            if not communication_obj.status:
                return { "status": False, "details": "Status is required" }
            if not communication_obj.recipients and original_status != 'DRAFT':
                return { "status": False, "details": "Recipients are required" }

            # Update communication fields
            comm.from_user_id = curr_user.user_id
            comm.subject = communication_obj.subject
            comm.content = communication_obj.content
            comm.type = communication_obj.type
            comm.status = communication_obj.status

            # -- Update recipients --
            new_recipient_ids = {r['id'] for r in communication_obj.recipients}
            existing_recipients = db.query(CommunicationToUSers).filter_by(communication_id=comm.id).all()

            for existing in existing_recipients:
                if existing.to_user_id not in new_recipient_ids:
                    db.delete(existing)

            for recipient in communication_obj.recipients:
                if 'id' not in recipient or 'email' not in recipient:
                    raise ValueError("Each recipient must have 'id' and 'email'")

                existing = db.query(CommunicationToUSers).filter_by(
                    communication_id=comm.id,
                    to_user_id=recipient['id']
                ).first()
                if not existing:
                    db.add(CommunicationToUSers(
                        communication_id=comm.id,
                        to_user_id=recipient['id']
                    ))
            file_paths = []  # Initialize an array for file paths
            # -- Handle attachments --
            if files:
                email_folder = os.path.join(root_file_path, "email", str(comm.id))
                os.makedirs(email_folder, exist_ok=True)

                

                for idx, file in enumerate(files):
                    content_bytes = await file.read()
                    file_path = os.path.join(email_folder, file.filename)

                    with open(file_path, "wb") as f:
                        f.write(content_bytes)

                    file_paths.append(file_path)  # Add the file path to the array

                    existing_attachment = db.query(CommunicationAttachment).filter_by(
                        communication_id=comm.id,
                        filename=file.filename
                    ).first()

                    if not existing_attachment:
                        db.add(CommunicationAttachment(
                            communication_id=comm.id,
                            file=file_path,
                            file_type=os.path.splitext(file.filename)[1][1:],
                            file_version=idx + 1,
                            file_size=file.size,
                            filename=file.filename
                        ))

            # If status changed to SENT, send emails
            if original_status == "DRAFT" and communication_obj.status.upper() == "SENT":
                for recipient in communication_obj.recipients:
                    send_email(recipient['email'], comm.subject, html_content=com_email_html('Users',comm.content), plain_text='',file_paths=file_paths)

        return { "status": True, "details": "Communication updated successfully" }

    except (ValueError, SQLAlchemyError, Exception) as e:
        db.rollback()
        return {
            "status": False,
            "details": "Error updating communication",
            "error": str(e)
        }
#list communication



@router.get("/communications", response_model=ResponseModel)
def list_communications(
    type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    Sender = aliased(User)
    Recipient = aliased(User)

    # Base query starts with Communication joined with sender User
    communications = db.query(Communication).join(Sender, Communication.from_user_id == Sender.id)

    # Apply role-based filtering
    if curr_user.role_id == secret.s_admin_role:
        # super admin: no additional filter needed
        pass
    elif curr_user.role_id == secret.p_admin_role:
        communications = communications.filter(Communication.province_id == curr_user.province_id)
    else:
        communications = communications.filter(Communication.from_user_id == curr_user.user_id)

    # Filter by communication type if provided
    if type:
        communications = communications.filter(Communication.type == type)

    # Apply search filter if search string provided
    if search:
        search_query = f"%{search}%"
        communications = communications\
            .join(CommunicationToUSers, CommunicationToUSers.communication_id == Communication.id)\
            .join(Recipient, CommunicationToUSers.to_user_id == Recipient.id)\
            .filter(
                or_(
                    Sender.name.ilike(search_query),
                    Sender.email.ilike(search_query),
                    cast(Sender.mobile_no, String).ilike(search_query),
                    Recipient.name.ilike(search_query),
                    Recipient.email.ilike(search_query),
                    cast(Recipient.mobile_no, String).ilike(search_query)
                )
            )

    # Remove duplicates due to join with multiple recipients
    communications = communications.distinct().order_by(Communication.id.desc())

    # Get total count before pagination
    comm_total = communications.count()

    # Pagination
    if limit and limit != 0:
        communications = communications.offset(skip).limit(limit)

    communications = communications.all()

    response = []
    for comm in communications:
        # Get recipients for this communication
        recipients = (
            db.query(CommunicationToUSers, User)
            .join(User, CommunicationToUSers.to_user_id == User.id)
            .filter(CommunicationToUSers.communication_id == comm.id)
            .all()
        )
        recipient_list = []
        if type == "mail":
            recipient_list = [{"id": user.id, "name": user.name, "email": user.email} for _, user in recipients]
        elif type == "sms":
            recipient_list = [{"id": user.id, "name": user.name, "phone_number": user.mobile_no} for _, user in recipients]

        # Get attachments
        attachments = (
            db.query(CommunicationAttachment)
            .filter(CommunicationAttachment.communication_id == comm.id)
            .all()
        )
        attachment_files = [{"id": a.id, "filename": a.filename, "file_path": a.file} for a in attachments]

        # Get sender name
        sender = db.query(User).filter(User.id == comm.from_user_id).first()
        sender_name = sender.name if sender else None

        response.append(
            CommunicationView(
                id=comm.id,
                subject=comm.subject,
                content=comm.content,
                type=comm.type,
                status=comm.status,
                recipients=recipient_list,
                attachments=attachment_files,
                sent_by=sender_name,
                sent_at=comm.created_at
            )
        )

    return ResponseModel(status=True, details="", total_count=comm_total, data=response)

@router.get("/communications/{comm_id}", response_model=CommunicationView)
def get_communication_by_id(comm_id: int, db: Session = Depends(get_db), curr_user: Token = Depends(authenticate)):
    try:
        comm = db.query(Communication).filter(Communication.id == comm_id).first()
        if not comm:
            return {"status": False, "details": "Communication not found"}

        # Recipients
        recipient_list = []
        recipients = (
            db.query(CommunicationToUSers, User)
            .join(User, CommunicationToUSers.to_user_id == User.id)
            .filter(CommunicationToUSers.communication_id == comm.id)
            .all()
        )
        recipient_list = [{"id": user.id, "name": user.username, "email": user.email, "phone_number": user.mobile_no} for _, user in recipients]

        # Attachments
        attachments = (
            db.query(CommunicationAttachment)
            .filter(CommunicationAttachment.communication_id == comm.id)
            .all()
        )
        attachment_files = [{"id": a.id, "filename": a.filename, "file_path": a.file} for a in attachments]

        # Sender
        sender = db.query(User).filter(User.id == comm.from_user_id).first()
        sender_name = sender.name if sender else "Unknown"

        return CommunicationView(
            id=comm.id,
            subject=comm.subject,
            content=comm.content,
            type=comm.type,
            status=comm.status,
            recipients=recipient_list,
            attachments=attachment_files,
            sent_by=sender_name,
            sent_at=comm.created_at
        )
    except Exception as e:
       
        return {"status": False, "details": "Internal Server Error: " + str(e)}


@router.delete("/communication_delete/{comm_id}")
async def delete_communication(
    comm_id: int,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        comm = db.query(Communication).filter_by(id=comm_id).first()
        if not comm:
            return { "status": False, "details": "Communication not found" }

        if comm.status.upper() != "DRAFT":
            return {
                "status": False,
                "details": "Only draft communications can be deleted"
            }

        # Delete associated recipients
        db.query(CommunicationToUSers).filter_by(communication_id=comm.id).delete()

        # Delete attachments and remove files from disk
        attachments = db.query(CommunicationAttachment).filter_by(communication_id=comm.id).all()
        for attachment in attachments:
            if attachment.file and os.path.exists(attachment.file):
                os.remove(attachment.file)
        db.query(CommunicationAttachment).filter_by(communication_id=comm.id).delete()

        # Delete the communication record itself
        db.delete(comm)
        db.commit()

        # Optionally remove the folder
        folder_path = os.path.join(root_file_path, "email", str(comm.id))
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)

        return { "status": True, "details": "Communication deleted successfully" }

    except Exception as e:
        return { "status": False, "details": str(e) }
   

@router.delete("/communication_attachment_delete/{attach_id}")
async def delete_communication_attachment(
    attach_id: int,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):
    try:
        attachment = db.query(CommunicationAttachment).filter_by(id=attach_id).first()
        if not attachment:
            return { "status": False, "details": "Attachment not found" }

        comm = db.query(Communication).filter_by(id=attachment.communication_id).first()
        if not comm or comm.status.upper() != "DRAFT":
            return {
                "status": False,
                "details": "Only attachments of draft communications can be deleted"
            }

        # Delete the attachment record itself
        db.delete(attachment)
        db.commit()

        # Optionally remove the file from disk
        if attachment.file and os.path.exists(attachment.file):
            os.remove(attachment.file)

        return { "status": True, "details": "Attachment deleted successfully" }

    except Exception as e:
        return { "status": False, "details": str(e) }



@router.post("/create_communication_sms")
async def create_communication_sms(
    data: CommunicationSMS,
    db: Session = Depends(get_db),
    curr_user: Token = Depends(authenticate)
):

    recipients = data.recipients
    message = data.message
    from_user_id = curr_user.user_id
    type = "sms"
    status = "SENT"


    # Step 2: Attempt to send all SMS first
    for recipient in recipients:

        if send_sms(recipient.phone_number, message):
            pass
        else:
            return {
                "status": False,
                "details": f"Error sending SMS to {recipient.phone_number}"
            }

    # Step 3: Proceed with DB insert only if all SMS are sent
    try:
        with db.begin():
            comm = Communication(
                province_id=curr_user.province_id if curr_user.province_id else None,
                from_user_id=from_user_id,
                subject="SMS",
                content=message,
                type=type,
                status=status,
                created_by=curr_user.user_id
                
            )
            db.add(comm)
            db.flush()

            for recipient in recipients:
                comm_to_user = CommunicationToUSers(
                    communication_id=comm.id,
                    to_user_id=recipient.id
                )
                db.add(comm_to_user)

        return {
            "status": True,
            "details": "Communication created successfully",
            "data": CommunicationResponse(
                id=comm.id,
                from_user_id=from_user_id,
                subject="SMS",
                content=message,
                type=type,
                status=status,
                created_at=comm.created_at
            )
        }

    except Exception as e:
        db.rollback()
        return { "status": False, "details": f"DB Error: {str(e)}" }
