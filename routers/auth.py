import time,models
from typing import Any
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from helper import *
from schemas import (
    LogoutResponse,
    Token,
    RefreshRequest,
    SendOtpRequest,
    VerifyOtpRequest,
    UserCreate,
    UserOut
)

router = APIRouter()


@router.post("/login", status_code=status.HTTP_200_OK)
async def login_user(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.User).filter(models.User.email == form_data.username.lower()))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})

    # Set HttpOnly cookies
    response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite="lax", max_age=15*60, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite="lax", max_age=7*24*3600, path="/")

    return {"message": "Login successful"}


@router.post("/token/refresh", response_model=Token)
async def refresh_token(body: RefreshRequest):
    payload = decode_token(body.refresh_token, token_type="refresh")
    new_access = create_access_token({"sub": payload["sub"]})
    return {"access_token": new_access, "token_type": "bearer"}


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_user(body: RefreshRequest):
    try:
        _ = decode_token(body.refresh_token, token_type="refresh")
    except:
        pass
    return LogoutResponse(msg="Logged out successfully")


# ── SEND OTP ───────────────────────────────────────────────────────────────────

@router.post("/send-otp", status_code=status.HTTP_200_OK)
async def send_otp_endpoint(
    request: SendOtpRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    email = request.email.lower()
    # Email must not already exist
    result = await db.execute(select(models.User).filter(models.User.email == email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already exists")

    otp_plain, expiry_ts = generate_otp()
    otp_hashed = hash_otp(otp_plain)

    store_otp_in_redis(email, otp_hashed, ttl_seconds=300)

    subject = "Your verification code"
    body = f"Your OTP is: {otp_plain}. It expires in 5 minutes."
    background_tasks.add_task(send_email, [email], subject, body)

    return {"message": "OTP sent successfully"}


# ── VERIFY OTP ─────────────────────────────────────────────────────────────────

@router.post("/verify-otp", status_code=status.HTTP_200_OK)
async def verify_otp_endpoint(
    request: VerifyOtpRequest,
    db: AsyncSession = Depends(get_db)
):
    email = request.email.lower()
    hashed = get_hashed_otp_from_redis(email)
    if not hashed:
        raise HTTPException(status_code=400, detail="OTP expired or not found")

    if not verify_hashed_otp(request.otp, hashed, expiry=time.time() + 1):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    delete_otp_from_redis(email)
    mark_email_verified(email, ttl_seconds=600)  # keep verified flag alive for 10 minutes

    return {"message": "OTP verified successfully"}


# ── REGISTER (requires prior OTP verification) ────────────────────────────────

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    email = user.email.lower()

    # 1️⃣ Check OTP verification in Redis
    if not is_email_verified(email):
        raise HTTPException(status_code=400, detail="Email not verified")

    # 2️⃣ Check username/email uniqueness
    result = await db.execute(select(models.User).filter(models.User.username == user.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already exists")

    result = await db.execute(select(models.User).filter(models.User.email == email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already exists")

    # 3️⃣ Persist the user
    hashed_password = hash_password(user.password)
    new_user = models.User(
        username=user.username,
        email=email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)


    clear_email_verified(email)

    access_token  = create_access_token({"sub": email})
    refresh_token = create_refresh_token({"sub": email})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,         # in prod HTTPS only
        samesite="lax",
        max_age=15 * 60,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 3600,
        path="/"
    )

    return new_user
