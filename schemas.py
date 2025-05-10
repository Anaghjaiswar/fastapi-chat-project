from datetime import date, datetime
from pydantic import BaseModel, Field, EmailStr

# ... means that the field is required

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=3, max_length=80)
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    is_active: bool = True
    is_verified: bool = False

    class Config:
        orm_mode = True  # This allows Pydantic to work with SQLAlchemy models directly

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutResponse(BaseModel):
    msg: str


class SendOtpRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class UserUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=3, max_length=80)
    username: str = Field(..., min_length=3, max_length=50)
    date_of_birth: date = Field(..., description="YYYY-MM-DD")  # YYYY-MM-DD format
    bio: str = Field(..., max_length=1000)
    photo: str | None = None 

    class Config:
        orm_mode = True

class DirectChatCreate(BaseModel):
    other_user_id: int


class DirectChatRead(BaseModel):
    id: int
    user_a_id: int
    user_b_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class GroupChatRead(BaseModel):
    id: int
    name: str
    description: str
    is_active: bool
    room_avatar: str

    class Config:
        orm_mode = True

# class GroupChatCreate(BaseModel):
#     created_by_id
    