from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from models import User
from schemas import UserCreate, UserOut
from helper import hash_password
from database import get_db

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
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
