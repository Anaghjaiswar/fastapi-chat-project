from typing import Any
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy.orm import Session
from dependencies import get_current_user
from schemas import LogoutResponse, Token, RefreshRequest, SendOtpRequest, VerifyOtpRequest
import models as models
from database import get_db
from models import User
from helper import create_access_token, create_refresh_token, generate_otp, send_email, verify_hashed_otp, verify_password, decode_token, hash_otp
from fastapi import Response
from sqlalchemy.future import select


router = APIRouter()

@router.post("/login", status_code=status.HTTP_200_OK)
async def login_user(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == form_data.username.lower()))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="user not found")
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="incorrect password")
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token({ "sub": user.email })

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,        # only over HTTPS/WSS in production
        samesite="lax",     # or "strict"
        max_age=15 * 60,    # e.g. 15 minutes
        path="/",           # send cookie on all paths
    )
    # — refresh token cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 3600,  # e.g. 7 days
        path="/",
    )

    return {"message": "Login successful"}


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


@router.post("/send-otp", status_code=status.HTTP_200_OK)
async def send_otp(email: str, request: SendOtpRequest, background_tasks: BackgroundTasks,db: Session = Depends(get_db)) -> Any:
    result = await db.execute(select(User).filter(models.User.email == request.email.lower()))
    user = result.scalars().first()

    if not user: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="USer not found")
    
    if user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already Verified")
    
    otp_plain, expiry = generate_otp()
    otp_hash = hash_otp(otp_plain)
    user.otp_hash = otp_hash
    user.otp_expiry = expiry
    db.add(user)
    await db.commit()

    subject = "Your verification code"
    body    = f"Your OTP is: {otp_plain}. It expires in 5 minutes."
    background_tasks.add_task(send_email, subject, [user.email], body)

    return {
        "message": "OTP sent successfully",
    }


@router.post("/verify-otp", status_code=status.HTTP_200_OK)
async def verify_otp_endpoint(request: VerifyOtpRequest,db: Session = Depends(get_db)) -> Any:
    result = await db.execute(select(User).filter(User.email == request.email.lower()))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2) check OTP exists
    if not user.otp_hash or not user.otp_expiry:
        raise HTTPException(status_code=400, detail="No OTP pending for this user")

    # 3) verify
    if not verify_hashed_otp(request.otp, user.otp_hash, user.otp_expiry):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # 4) mark verified & clear OTP
    user.is_verified = True
    user.otp_hash    = None
    user.otp_expiry  = None
    db.add(user)
    await db.commit()

    return {"message": "Email verified successfully"}
