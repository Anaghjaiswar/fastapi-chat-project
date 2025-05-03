from typing import Union
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Boolean
from database import Base



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, max_length=50)
    email = Column(String,vunique=True, index=True)
