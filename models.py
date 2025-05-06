from typing import Union
from pydantic import BaseModel
from sqlalchemy import Column, Date, DateTime, Float, Integer, String, Boolean, func
from database import Base
from pytz import timezone
from datetime import datetime



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String,unique=True, index=True)
    full_name = Column(String, index=True)
    photo = Column(String)  #we will store the url of photo
    hashed_password = Column(String)
    date_of_birth = Column(Date)
    bio = Column(String(1000))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    otp_hash = Column(String, nullable=True)   # new
    otp_expiry = Column(Float,  nullable=True) 
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone('Asia/Kolkata')))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone('Asia/Kolkata')), onupdate=lambda: datetime.now(timezone("Asia/Kolkata")))