from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from settings.config import secret
from schemas.access_control import Token
import re
from jwt import decode, ExpiredSignatureError, InvalidTokenError
# from jose import JWTError
import jwt

oauth= OAuth2PasswordBearer(tokenUrl="/access/login")    

# jwt token
def genToken(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=secret.expire)
    to_encode.update({
        "exp": expire,
        "active": data.get("active", False)  # Include user's active status
    })
    token = jwt.encode(to_encode, secret.secret_key, algorithm=secret.algorithm)
    return token

def verifyToken(token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    inactive_user_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User account is inactive",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, secret.secret_key, algorithms=[secret.algorithm])
        username: str = payload.get("username")
        active: bool = payload.get("active", False)
        
        if username is None:
            raise credentials_exception
            
        if not active:
            raise inactive_user_exception
        
        return Token(**payload)
    except HTTPException as he:
        raise he
    except:
        raise credentials_exception

def verify_file_token(token: str):
    credentials_exception= HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload= jwt.decode(token, secret.secret_key, algorithms=[secret.algorithm])
        return payload
    except Exception as e:
        print(e)
        raise credentials_exception

def authenticate(token= Depends(oauth)):
    return verifyToken(token)

def authAdmin(token= Depends(oauth)):
    data= verifyToken(token)
    if data.role_id != secret.s_admin_role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return data


# Hash pwd
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def encrypt(pwd):
    return pwd_context.hash(pwd)
def verify_pwd(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

#access token for forgot password
def access_token_forgot_password(data: dict, expires_delta: timedelta = timedelta(hours=1)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    token= jwt.encode(to_encode, secret.secret_key, algorithm=secret.algorithm)
    return token

#accss for change password
def decode_token(token: str):
    return jwt.decode(token, secret.secret_key, algorithms=["HS256"])


def verify_action_token(token: str, max_age: int):
    try:
        # Decode the token
        decoded_token = decode(token, secret.secret_key, algorithms=["HS256"])
        
        # Check if the token is expired by comparing the "exp" field to the current time
        exp_timestamp = decoded_token.get("exp")
        if exp_timestamp is None or datetime.utcfromtimestamp(exp_timestamp) < datetime.utcnow():
            return None  # Token has expired
        
        # If the token is within the max_age window (in seconds)
        token_age = datetime.utcnow() - datetime.utcfromtimestamp(exp_timestamp)
        if token_age > timedelta(seconds=max_age):
            return None  # Token is older than allowed max_age
        
        # If all checks pass, return the user ID or whatever data you want from the token
        return decoded_token.get("sub")  # assuming "sub" holds user ID or relevant info
    
    except ExpiredSignatureError:
        return None  # Token has expired
    except InvalidTokenError:
        return None  # Invalid token
    
    
    
    
#superadmin token
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 3  # 3 days

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode,  secret.secret_key, algorithm=secret.algorithm)

#Verfiy token
def decode_jwt_token(token: str):
    try:
        payload = jwt.decode(token, secret.secret_key, algorithms=secret.algorithm)
        
        # Add readable expiry datetime
        if "exp" in payload:
            payload["exp_datetime"] = datetime.utcfromtimestamp(payload["exp"]).isoformat() + "Z"
        
        return {"valid": True, "payload": payload}
    
    except Exception as e:
        return {"valid": False, "error": str(e)}
