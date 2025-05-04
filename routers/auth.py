from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from schemas import Token
import models as models
from database import get_db
from models import User
from helper import create_access_token, verify_password
from sqlalchemy.future import select


router = APIRouter()

@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == form_data.username.lower()))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="user not found")
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="incorrect password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
        }
    }


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_user(db: Session = Depends(get_db)):
    # Invalidate the token or perform any necessary logout actions
    pass