from cloudinary.uploader import upload
from datetime import datetime, timedelta
import random
import secrets
from typing import Any, Dict, List
import jwt
from passlib.context import CryptContext
from fastapi_mail import MessageSchema
from config import *
import time
from fastapi import UploadFile, File, Form

# 
# ~~~~~~password hashing Functions~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# 
# ~~~~~~Token verification functions~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# 

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.now() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data:dict, expires_delta: timedelta = timedelta(minutes=REFRESH_TOKEN_EXPIRE_DAYS)):
    to_encode = data.copy()
    expire = datetime.now() + expires_delta
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """
    Decode & verify an access or refresh token.
    Raises jwt exceptions on failure.
    """
    secret = JWT_SECRET_KEY if token_type=="access" else JWT_REFRESH_SECRET_KEY
    payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    if payload.get("type") != token_type:
        raise jwt.InvalidTokenError(f"Expected {token_type} token")
    return payload

# 
# ~~~~~~Email functions~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# 

fast_mail = FastMail(conf)

async def send_email(subject: str, email_to: List[str], body: str, subtype: str = "plain"):
    """
    Utility function to send emails.
    """
    message = MessageSchema(
        subject=subject,
        recipients=email_to,  
        body=body,
        subtype=subtype  
    )
    await fast_mail.send_message(message)
    
# 
# ~~~~~~OTP functions~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# 

def generate_otp() -> tuple[str, float]:
    otp = ''.join(secrets.choice("0123456789") for _ in range(6))
    expiry = time.time() + 300  
    return otp, expiry

def hash_otp(otp: str) -> str:
    return pwd_context.hash(otp)

def verify_hashed_otp(plain_otp: str, hashed_otp: str, expiry: float) -> bool:
    return pwd_context.verify(plain_otp, hashed_otp) and time.time() < expiry


# 
# ~~~~~~file upload utility~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# 

def upload_file_to_cloudinary(file, folder: str = None) -> str:
    """
    Uploads a file to Cloudinary and returns the URL.
    """
    try:
        upload_options = {}

        if folder:
            upload_options["folder"] = folder
        response = upload(file, **upload_options)

        return response.get("url")
    except Exception as e:
        raise RuntimeError(f"Failed to upload file to Cloudinary: {str(e)}")

