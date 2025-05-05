from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy.orm import Session
from dependencies import get_current_user
from schemas import LogoutResponse, Token, RefreshRequest
import models as models
from database import get_db
from models import User
from helper import create_access_token, create_refresh_token, verify_password, decode_token

from sqlalchemy.future import select


router = APIRouter()

@router.post("/login", status_code=status.HTTP_200_OK)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == form_data.username.lower()))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="user not found")
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="incorrect password")
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token({ "sub": user.email })

    return {
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/token/refresh", response_model=Token)
async def refresh_token(body: RefreshRequest):
    # body.refresh_token comes from client
    payload = decode_token(body.refresh_token, token_type="refresh")
    new_access = create_access_token({ "sub": payload["sub"] })
    return { 
        "access_token": new_access, 
        "token_type": "bearer"     
    }
 
@router.post("/logout", status_code=status.HTTP_200_OK, dependencies=[Depends(get_current_user)])
async def logout_user(body: RefreshRequest):
    """
    Logout when using access‑only refresh:
    Client should delete both access_token and refresh_token.
    We do not track tokens server‑side in this approach.
    """
    # Optionally, you can verify the refresh token is well‑formed:
    try:
        payload = decode_token(body.refresh_token, token_type="refresh")
    except jwt.PyJWTError:
        # if token is already invalid/expired, still return success
        return LogoutResponse(msg="Logged out successfully")

    # no server‑side revoke needed in access‑only flow
    return LogoutResponse(msg="Logged out successfully")