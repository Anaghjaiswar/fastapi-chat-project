from cloudinary.uploader import upload
from datetime import datetime, timedelta
import random
import secrets
from typing import Any, Dict, List
import jwt
from passlib.context import CryptContext
from fastapi_mail import MessageSchema
from sqlalchemy import select
from config import *
import time
from fastapi import HTTPException, UploadFile, File, Form,status
from sqlalchemy.ext.asyncio import AsyncSession
from models import Message


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
    to_encode.update({"exp": expire, "type": "access"})
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

async def mark_email_verified(email: str, ttl_seconds: int = 600):
    key = f"verified:{email}"
    await redis_client.setex(key, ttl_seconds, "1")

async def is_email_verified(email: str) -> bool:
    return await redis_client.exists(f"verified:{email}") == 1

async def clear_email_verified(email: str):
    await redis_client.delete(f"verified:{email}")

    
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

async def store_otp_in_redis(email: str, hashed_otp: str, ttl_seconds: int = 300) -> None:
    """
    Store hashed OTP under key otp:{email}, expire after ttl_seconds.
    """
    key = f"otp:{email}"
    await redis_client.setex(key, ttl_seconds, hashed_otp)

async def get_hashed_otp_from_redis(email: str) -> str | None:
    """
    Retrieve the hashed OTP for this email, or None if missing/expired.
    """
    key = f"otp:{email}"
    return await redis_client.get(key)

async def delete_otp_from_redis(email: str) -> None:
    """
    Remove the OTP entry after successful verification.
    """
    key = f"otp:{email}"
    await redis_client.delete(key)


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

# 
# ~~~~~~Chat Helper Functions~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# 
async def update_message_reaction(
    db: AsyncSession,
    message_id: int,
    user_id: int,
    emoji: str
):
    result = await db.execute(select(Message).filter(Message.id == message_id))
    msg = result.scalars().first()
    if not msg:
        return
    reactions = msg.reactions or {}
    users = set(reactions.get(emoji, []))
    if user_id in users:
        users.remove(user_id)
    else:
        users.add(user_id)
    reactions[emoji] = list(users)
    msg.reactions = reactions
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

async def edit_message(
    db: AsyncSession,
    message_id: int,
    user_id: int,
    new_content: str
):
    result = await db.execute(select(Message).filter(Message.id == message_id))
    msg = result.scalars().first()
    if not msg or msg.sender_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit this message")
    msg.content = new_content
    msg.is_edited = True
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg

async def delete_message(
    db: AsyncSession,
    message_id: int,
    user_id: int
):
    result = await db.execute(select(Message).filter(Message.id == message_id))
    msg = result.scalars().first()
    if not msg or msg.sender_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete this message")
    msg.is_deleted = True
    db.add(msg)
    await db.commit()
