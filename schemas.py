from datetime import date, datetime
# from sqlalchemy import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from enum import Enum

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

class UserSummary(BaseModel):
    id: int
    full_name: str
    photo: Optional[str] = None

    model_config = {"from_attributes": True}

class GroupChatRead(BaseModel):
    id: int
    name: str
    description: str
    is_active: bool
    room_avatar: str

    class Config:
        orm_mode = True

class ChatRoomCreate(BaseModel):
    name: str = Field(..., max_length=50)
    description: Optional[str] = Field(None, max_length=1000)
    room_avatar: Optional[str] = None
    member_ids: List[int] = Field(..., min_length=1)

class ChatRoomResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    room_avatar: Optional[str]
    is_active: bool
    created_at: datetime
    created_by: UserSummary
    members: List[UserSummary]

    model_config = {"from_attributes": True}


class ChatRoomSummary(BaseModel):
    id: int
    name: str
    room_avatar: Optional[str]

    model_config = {"from_attributes": True}

class RequestStatusEnum(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class FriendRequestCreate(BaseModel):
    to_user_id: int

    class Config:
        orm_mode = True


class FriendRequestResponse(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    status: RequestStatusEnum
    created_at: datetime

    class Config:
        orm_mode = True

class PendingRequestResponse(BaseModel):
    id: int
    to_user: UserSummary
    created_at: datetime

    model_config = {
        "from_attributes": True,    
        # "populate_by_name": True    
    }

class Friendship(BaseModel):
    user_id: int
    friend_id: int
    since: datetime

    model_config = {
        "from_attributes": True,     # allow pulling from ORM attributes
        "populate_by_name": True     # allow Field(alias=...) to work
    }

class ReceivedRequest(BaseModel):
    id: int
    from_user: UserSummary
    received_at: datetime = Field(alias="created_at")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }

class GetRequest(BaseModel):
    id: int