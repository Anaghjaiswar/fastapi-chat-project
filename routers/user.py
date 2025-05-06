from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from dependencies import get_current_user
from models import User
from schemas import UserCreate, UserOut , UserUpdate
from helper import hash_password, upload_file_to_cloudinary
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.username == user.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    result = await db.execute(select(User).filter(User.email == user.email.lower()))
    existing_email = result.scalars().first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    hashed_password = hash_password(user.password)

    new_user = User(
        username=user.username,
        email=user.email.lower(),
        full_name=user.full_name,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

@router.post("/update",response_model=UserUpdate,status_code=status.HTTP_200_OK)
async def update_user(
    full_name: Optional[str]     = Form(None, min_length=3, max_length=80),
    username: Optional[str]      = Form(None, min_length=3, max_length=50),
    date_of_birth: Optional[date] = Form(None),                
    bio: Optional[str]           = Form(None, max_length=1000),
    photo: Optional[UploadFile]  = File(None),
    db: AsyncSession             = Depends(get_db),
    current_user: User           = Depends(get_current_user),
):
    # 1) only if they sent a new username do we check for conflicts
    if username is not None and username != current_user.username:
        conflict = await db.execute(
            select(User).filter(
                User.username == username,
                User.id != current_user.id
            )
        )
        if conflict.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already in use"
            )
        # safe to assign
        current_user.username = username

    # 2) only if they sent a new DOB
    if date_of_birth is not None:
        current_user.date_of_birth = date_of_birth

    # 3) only if they sent a new bio
    if bio is not None:
        current_user.bio = bio

    # 4) only if they uploaded a new photo
    if photo:
        file_bytes = await photo.read()
        url = upload_file_to_cloudinary(file_bytes, folder="user_profile_photos")
        current_user.photo = url

    if full_name is not None:
        current_user.full_name = full_name

    # 4) persist and return
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user