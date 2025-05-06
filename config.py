import ssl
import cloudinary
import os
from fastapi_mail import ConnectionConfig, FastMail
from dotenv import load_dotenv
import redis.asyncio as redis
from urllib.parse import urlparse

load_dotenv()

cloud = cloudinary.config(
    CLOUD_NAME= os.getenv('CLOUDINARY_CLOUD_NAME'),
    API_KEY= os.getenv('CLOUDINARY_API_KEY'),
    API_SECRET= os.getenv('CLOUDINARY_API_SECRET'),
)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),   
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),   
    MAIL_FROM     = os.getenv("MAIL_FROM"),
    MAIL_PORT     = 587,
    MAIL_SERVER   = "smtp.gmail.com",
    MAIL_STARTTLS = True,      
    MAIL_SSL_TLS  = False      
)


redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    username=os.getenv("REDIS_USERNAME"),
    password=os.getenv("REDIS_PASSWORD"),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=os.getenv("REDIS_DECODE_RESPONSES", "True") == "True",
)
