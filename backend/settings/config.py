import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Secret(BaseSettings):
    database: str
    dbuser: str
    password: str
    host: str
    port: str

    secret_key: str
    algorithm: str
    expire: int

    s_admin_role:int
    s_email:str
    s_username:str
    ddm_user_role:int
    p_admin_role:int
    file_base_url:str
    profile_base_url:str
    
    community_id:int
    society_id:int

    app_name: str
    website_url: str

    email: str
    app_password: str
      
     
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_phone_number: str

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), '..', '.env'),
        env_file_encoding='utf-8'
    )

secret = Secret()
