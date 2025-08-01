import random
import string
from sqlalchemy.orm import Session
from models.configuration import FinancialPortfolioMap
from settings.config import secret
from schemas.access_control import Token
from models.access_control import Province, Country, State, Region, District
from models.configuration import Community, CommunityUser, CFP, CFPUser, Society, SocietyUser, SFP, SFPUser, LegalEntity, LegalEntityUser, LEFP, LEFPUser
from datetime import datetime,timedelta,date
from dateutil.relativedelta import relativedelta
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText
from settings.auth import access_token_forgot_password
from settings.config import secret
from constants.mail_layout import layout_html, APP_NAME
import smtplib
from email import encoders
import pandas as pd
import io, os
import re
from typing import Optional,List
from twilio.rest import Client
limit_count= 25
str_to_arr= lambda x: [i for i in x.split(",") if i.strip() ]
root_path= os.getcwd()
change_name= lambda x: '_'.join(x.split(' '))
alter_filename= lambda name, version: name.split('.')[0] + '_version_' + str(version) + '_' + str(datetime.now().timestamp()) + '.' + name.split('.')[1]
file_location= lambda community_name, category_name, fin_year, q_name : os.path.join( change_name(community_name), change_name(category_name), fin_year, change_name(q_name) )


def generate_password(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=length))

password = generate_password()

# Get new community id
def get_new_code(db:Session, model, prefix):
    latest_record= db.query(model.code).order_by(model.id.desc()).first()
    if not latest_record:
        return prefix+"0001"
    latest_record= latest_record[0]
    latest_record= int(latest_record[4:]) +1
    return prefix+str(latest_record).zfill(4)

# get mapped financial portfolio for non-financial like community -TDS, EPF, ESI
def mapped_financial(db:Session, portfolio_id):
    query= db.query(FinancialPortfolioMap).filter(FinancialPortfolioMap.non_financial_portfolio_id == portfolio_id)
    total= query.count()
    data= query.all()
    temp= {"non_fianacial_name": None, "financial_name": []}
    if not data:
        return (temp, total)
    temp['non_fianacial_name']= data[0].non_financial_name.name
    for i in data:
        temp['financial_name'].append({"id": i.id, "portfolio_id" : i.financial_portfolio_id, "name": i.financial_name.name})
    return (temp, total)

def authenticate_permission(curr_user:Token, db:Session, query, port_model, type):
    if curr_user.role_id == secret.p_admin_role:
        query= query.filter(port_model.province_id == curr_user.province_id)
    elif curr_user.role_id != secret.s_admin_role:
        query= query.filter(port_model.province_id == curr_user.province_id)
        if type == "community":
            query= query.filter(Community.id.in_(db.query(CommunityUser.community_id).filter(CommunityUser.user_id == curr_user.user_id).scalar_subquery()) |
                Community.id.in_( db.query(CFP.community_id).filter(
                CFP.id.in_( db.query(CFPUser.cfp_id).filter(CFPUser.user_id == curr_user.user_id))).scalar_subquery())
            )
        elif type == "society":
            query= query.filter(Society.id.in_(db.query(SocietyUser.society_id).filter(SocietyUser.user_id == curr_user.user_id).scalar_subquery()) |
                Society.id.in_( db.query(SFP.society_id).filter(
                SFP.id.in_( db.query(SFPUser.sfp_id).filter(SFPUser.user_id == curr_user.user_id))).scalar_subquery())
            )
        elif type == "legal_entity":
            query= query.filter(LegalEntity.id.in_(db.query(LegalEntityUser.legal_entity_id).filter(LegalEntityUser.user_id == curr_user.user_id).scalar_subquery()) |
                LegalEntity.id.in_( db.query(LEFP.legal_entity_id).filter(
                LEFP.id.in_( db.query(LEFPUser.lefp_id).filter(LEFPUser.user_id == curr_user.user_id))).scalar_subquery())
            )
    return query

def gen_file(file_data, only_cols= False):
    df = pd.DataFrame(file_data)
    if only_cols:
        df= pd.DataFrame(columns= file_data)
    # Save to an in-memory buffer
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False)
    output.seek(0)  # Move to the beginning of the stream

    return output

def get_province_locations(province_id, db:Session):
    province_loc= db.query(Province).with_entities(Province.country_ids, Province.state_ids, Province.region_ids, Province.district_ids).filter(Province.id == province_id).first()
    districts= db.query(District).with_entities(District.id, District.name).filter(District.id.in_(str_to_arr(province_loc.district_ids))).order_by(District.name.asc()).all()
    regions= db.query(Region).with_entities(Region.id, Region.name).filter(Region.id.in_(str_to_arr(province_loc.region_ids))).order_by(Region.name.asc()).all()
    states= db.query(State).with_entities(State.id, State.name).filter(State.id.in_(str_to_arr(province_loc.state_ids))).order_by(State.name.asc()).all()
    countries= db.query(Country).with_entities(Country.id, Country.name).filter(Country.id.in_(str_to_arr(province_loc.country_ids))).order_by(Country.name.asc()).all()

    return {"districts": districts, "regions": regions, "states": states, "countries": countries}

def check_locations(db:Session, province_id, country_id, state_id, region_id, district_id):
    locations= get_province_locations(province_id, db)
    if country_id not in [i.id for i in locations["countries"]]:
        return "Country not found"
    if state_id not in [i.id for i in locations["states"]]:
        return "State not found"
    if region_id not in [i.id for i in locations["regions"]]:
        return "Region not found"
    if district_id not in [i.id for i in locations["districts"]]:
        return "District not found"
    return None
    
# get current financial year
def get_curr_financial_year():
    current_year = datetime.today().year
    start_year = current_year if datetime.today().month >= 4 else current_year - 1
    end_year = start_year + 1
    return f"{start_year}-{end_year}"


#Generate email for users
def send_email(
    email: str,
    subject: str,
    html_content: str,
    plain_text: str = "Please view this email in HTML format.",
    file_paths: Optional[List[str]] = None
):
    msg = MIMEMultipart("mixed")
    msg["Subject"] = subject
    msg["From"] = f"{APP_NAME} <{secret.email}>"
    msg["To"] = email

    # Add text and HTML content
    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    # Attach multiple files
    if file_paths:
        for file_path in file_paths:
            try:
                with open(file_path, "rb") as file:
                    part = MIMEApplication(file.read(), Name=os.path.basename(file_path))
                part['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
                msg.attach(part)
            except Exception as e:
                print(f"Failed to attach file {file_path}: {e}")

    # Send the email
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(secret.email, secret.app_password)
            server.sendmail(msg["From"], msg["To"], msg.as_string())
    except Exception as e:
        print(f"Failed to send email to {email}: {e}")
       
        

#split month based on iteration 
def split_month_ranges_custom(start_date, end_date, iteration):
    ranges = []
    current_start = start_date
    while current_start < end_date:
        # Calculate end of current quarter
        current_end = current_start + relativedelta(months=iteration) - relativedelta(days=1)  
        
        # Clamp to end_date if necessary
        if current_end > end_date:
            current_end = end_date
            
        ranges.append((current_start, current_end))
        
        # Move to next quarter start
        current_start = current_end + relativedelta(days=1)
    
    return ranges
    

#data validation for financial 

def validate_identifier(identifier_type, value):
    
    patterns = {
        "EPF": r"^[A-Z]{5}\d{10}$",
        "ESI": r"^\d{17}$",
        "GST": r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}Z{1}[0-9]{1}$",
        "TDS": r"^[A-Z]{4}[0-9]{5}[A-Z]{1}$",
        "PAN": r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
    }
    pattern = patterns.get(identifier_type)
    
    if pattern and value:
        value = str(value).strip()  #  Convert to string safely
        return re.fullmatch(pattern, value) is not None
    return True  # Skip if value is empty

#Data validation 
FORMAT_HINTS = {
    "EPF": "Example_Format: ABCDE1234567890 ",
    "ESI": "Example_Format: 12345678901234567 (17 digits)",
    "GST": "Example_Format: 33ABCDE1234F1Z5",
    "TAN": "Example_Format: ABCD12345A",
    "PAN": "Example_Format: ABCDE1234A"
}



# Helper Functions for Date Ranges
# def get_last_month_range():
#     today = datetime.today()
#     first_day_this_month = today.replace(day=1)
#     last_day_last_month = first_day_this_month - timedelta(days=1)
#     first_day_last_month = last_day_last_month.replace(day=1)
#     return first_day_last_month, last_day_last_month

# def get_last_quarter_range():
#     today = datetime.today()
#     quarter = (today.month - 1) // 3 + 1
#     first_month_of_this_quarter = 3 * (quarter - 1) + 1
#     first_day_this_quarter = datetime(today.year, first_month_of_this_quarter, 1)
#     last_day_last_quarter = first_day_this_quarter - timedelta(days=1)
#     first_day_last_quarter = last_day_last_quarter.replace(day=1) - timedelta(weeks=12)
#     first_day_last_quarter = first_day_last_quarter.replace(day=1)
#     return first_day_last_quarter, last_day_last_quarter


#premisssin based on the userid
def authenticate_permission_user(user_id: int, role_id: int, province_id: int, db: Session, query, port_model, type: str):
    if role_id == secret.p_admin_role:
        query = query.filter(port_model.province_id == province_id)
    elif role_id != secret.s_admin_role:
        query = query.filter(port_model.province_id == province_id)

        if type == "community":
            query = query.filter(
                Community.id.in_(
                    db.query(CommunityUser.community_id).filter(CommunityUser.user_id == user_id).scalar_subquery()
                ) |
                Community.id.in_(
                    db.query(CFP.community_id).filter(
                        CFP.id.in_(
                            db.query(CFPUser.cfp_id).filter(CFPUser.user_id == user_id)
                        )
                    ).scalar_subquery()
                )
            )

        elif type == "society":
            query = query.filter(
                Society.id.in_(
                    db.query(SocietyUser.society_id).filter(SocietyUser.user_id == user_id).scalar_subquery()
                ) |
                Society.id.in_(
                    db.query(SFP.society_id).filter(
                        SFP.id.in_(
                            db.query(SFPUser.sfp_id).filter(SFPUser.user_id == user_id)
                        )
                    ).scalar_subquery()
                )
            )

        elif type == "legal_entity":
            query = query.filter(
                LegalEntity.id.in_(
                    db.query(LegalEntityUser.legal_entity_id).filter(LegalEntityUser.user_id == user_id).scalar_subquery()
                ) |
                LegalEntity.id.in_(
                    db.query(LEFP.legal_entity_id).filter(
                        LEFP.id.in_(
                            db.query(LEFPUser.lefp_id).filter(LEFPUser.user_id == user_id)
                        )
                    ).scalar_subquery()
                )
            )

    return query



def send_sms(to, message):
    TWILIO_ACCOUNT_SID = secret.twilio_account_sid
    TWILIO_AUTH_TOKEN = secret.twilio_auth_token
    TWILIO_PHONE_NUMBER = secret.twilio_phone_number
    print("message:",message,"from:",TWILIO_PHONE_NUMBER,"to:",to)
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to
        )
        
        return True
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False

