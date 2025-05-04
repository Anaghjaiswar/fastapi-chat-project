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
    