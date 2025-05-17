from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.future import select
from dependencies import get_current_user
from sqlalchemy import exists, and_
from models import FriendRequest, RequestStatus, User, friendship
from schemas import *
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


@router.get("/list",response_model=List[UserSummary], status_code=status.HTTP_200_OK)
async def list_users(me: User = Depends(get_current_user),db: AsyncSession = Depends(get_db)):
   
    # exclude pending requests only
    pending = exists().where(
        FriendRequest.from_user_id == me.id,
        FriendRequest.to_user_id   == User.id,
        FriendRequest.status == RequestStatus.PENDING
    )

    # exclude already‐friends
    is_friend = exists().where(
        friendship.c.user_id   == me.id,
        friendship.c.friend_id == User.id
    )

    q = (
        select(User)
        .where(User.id != me.id)
        .where(~pending)
        .where(~is_friend)
    )

    result = await db.execute(q)
    users = result.scalars().all()
    return users

@router.post("/send-request", response_model=FriendRequestResponse, status_code=status.HTTP_201_CREATED)
async def send_request(request: FriendRequestCreate, me: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    
    to_user_id = request.to_user_id
    result = await db.execute(select(User).where(User.id == to_user_id))
    to_user = result.scalar_one_or_none()

    if not to_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    result = await db.execute(
        select(FriendRequest)
        .where(
            (FriendRequest.from_user_id == me.id)
            & (FriendRequest.to_user_id == to_user_id)
        )
        .options(joinedload(FriendRequest.from_user), joinedload(FriendRequest.to_user))
    )
    existing_request = result.scalar_one_or_none()

    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Friend request already exists with status: {existing_request.status}.",
        )
    
    new_request = FriendRequest(from_user_id = me.id, to_user_id=to_user_id)

    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    return new_request

@router.get('/pending-requests', response_model=List[PendingRequestResponse], status_code=status.HTTP_200_OK)
async def list_pending_requests(
    me: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[PendingRequestResponse]:
    
    q = (
        select(FriendRequest)
        .options(joinedload(FriendRequest.to_user))
        .where(
            FriendRequest.from_user_id == me.id,
            FriendRequest.status == RequestStatus.PENDING,
        )
    )

    result = await db.execute(q)
    pending_requests = result.scalars().all()

    return [PendingRequestResponse.model_validate(req) for req in pending_requests]
    
@router.get('/received-requests', response_model=List[ReceivedRequest], status_code=status.HTTP_200_OK)
async def list_received_requests(
    me: User = Depends(get_current_user),       
    db: AsyncSession = Depends(get_db)
) -> List[ReceivedRequest]:
    
    q = (
        select(FriendRequest)
        .options(joinedload(FriendRequest.from_user))
        .where(
            FriendRequest.to_user_id == me.id,
            FriendRequest.status == RequestStatus.PENDING, 
        )
    )

    result = await db.execute(q)
    received_requests = result.scalars().all()

    return [ReceivedRequest.model_validate(req) for req in received_requests]
