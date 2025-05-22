import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, WebSocket, WebSocketDisconnect, status
import jwt
from sqlalchemy import and_, or_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from database import get_db
from dependencies import get_current_user
from models import Message, ChatRoom, DirectChat, User, room_members, friendship
from connection_manager import manager
from schemas import DirectChatRead, DirectChatCreate, GroupChatRead, ChatRoomCreate
from config import JWT_SECRET_KEY
from helper import upload_file_to_cloudinary, update_message_reaction, edit_message, delete_message


router = APIRouter()

# helper to authenticate your ws connection
async def get_current_user_ws(websocket: WebSocket, db: AsyncSession) -> User | None:
    token = websocket.cookies.get("access_token")
    if not token:
        return None
    
     # 2) decode JWT
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    
    # 3) look up user
    result = await db.execute(select(User).filter(User.email == payload.get("sub")))
    return result.scalars().first()


async def save_message(
    db: AsyncSession,
    sender_id: int,
    content: str,
    channel: str,
    channel_id: int,
    message_type: str = "text"       
):

    msg = Message(
        sender_id=sender_id,
        content=content,
        message_type=message_type,
        created_at=datetime.now(),
        **({ "room_id": channel_id } if channel=="room" else { "direct_chat_id": channel_id })
    )

    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


@router.websocket("/ws/rooms/{room_id}")
async def ws_room(
    room_id: int,
    websocket: WebSocket,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    
    # authorize: ensure user is member of room
    result = await db.execute(select(ChatRoom).filter(ChatRoom.id==room_id))
    room = result.scalars().first()
    if not room or current_user.id not in [u.id for u in room.members]:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    await manager.connect(websocket, "room", room_id)
    asyncio.create_task(manager.listen_to_redis("room", room_id))

    try:
        while True:
            data = await websocket.receive_json()
            # data: {"content": "...", "type":"text"}
            msg = await save_message(
                db, current_user.id, data["content"], "room", room_id, data.get("type","text")
            )
             # broadcast DB‑backed message
            await manager.broadcast("room", room_id, {
                "id": msg.id,
                "room_id": room_id,
                "sender_id": current_user.id,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat()
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket, "room", room_id)


@router.websocket("/ws/direct/{chat_id}")
async def ws_direct(
    chat_id: int,
    websocket: WebSocket,
    db: AsyncSession = Depends(get_db),
):
    user = await get_current_user_ws(websocket, db)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # authorize: ensure user is part of this direct chat
    result = await db.execute(select(DirectChat).filter(DirectChat.id == chat_id))
    chat = result.scalars().first()
    if not chat or user.id not in (chat.user_a_id, chat.user_b_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, "direct", chat_id)
    asyncio.create_task(manager.listen_to_redis("direct", chat_id))

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action", "message")

            if action == "typing":
                await manager.broadcast("direct", chat_id, {
                    "action": "typing",
                    "user_id": user.id,
                })
                continue

            if action == "reaction":
                msg_id = data["message_id"]
                emoji = data["emoji"]
                await update_message_reaction(db, msg_id, user.id, emoji)
                await manager.broadcast("direct", chat_id, {
                    "action": "reaction",
                    "message_id": msg_id,
                    "user_id": user.id,
                    "emoji": emoji,
                })
                continue

            if action == "edit":
                msg_id = data["message_id"]
                new_content = data.get("content")
                msg = await edit_message(db, msg_id, user.id, new_content)
                await manager.broadcast("direct", chat_id, {
                    "action": "edit",
                    "message_id": msg.id,
                    "content": msg.content,
                    "edited": True,
                })
                continue

            if action == "delete":
                msg_id = data["message_id"]
                await delete_message(db, msg_id, user.id)
                await manager.broadcast("direct", chat_id, {
                    "action": "delete",
                    "message_id": msg_id,
                })
                continue

            if action == "reply":
                parent_id = data["parent_id"]
                content = data.get("content")
                msg = await save_message(
                    db, user.id, content, "direct", chat_id, data.get("type", "text"), parent_message_id=parent_id
                )
                await manager.broadcast("direct", chat_id, {
                    "action": "reply",
                    "id": msg.id,
                    "parent_id": parent_id,
                    "sender_id": user.id,
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat(),
                })
                continue

            # default: regular message
            msg = await save_message(
                db, user.id, data["content"], "direct", chat_id, data.get("type", "text")
            )
            await manager.broadcast("direct", chat_id, {
                "action": "message",
                "id": msg.id,
                "direct_chat_id": chat_id,
                "sender_id": user.id,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat(),
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket, "direct", chat_id)


@router.post('/create-direct-chat', response_model=DirectChatRead, status_code=status.HTTP_201_CREATED)
async def create_direct_chat(data: DirectChatCreate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    
    if data.other_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,details = "Cannot open a direct chat with yourself")
    
    other_user = await db.execute(select(User).filter(User.id == data.other_user_id))
    second_user = other_user.scalars().first()

    if not second_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="second user not found")
    
    friend_check = await db.execute(
        select(friendship)
        .where(
            and_(
                friendship.c.user_id == current_user.id,
                friendship.c.friend_id == data.other_user_id
            )
        )
    )
    if not friend_check.first():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only start a chat with a friend"
        )
    
    
    # see if chat already exists (either ordering)
    q = await db.execute(
        select(DirectChat).filter(
            or_(
                and_(
                    DirectChat.user_a_id == current_user.id,
                    DirectChat.user_b_id == data.other_user_id
                ),
                and_(
                    DirectChat.user_a_id == data.other_user_id,
                    DirectChat.user_b_id == current_user.id
                )
            )
        )
    )
    existing = q.scalars().first()
    if existing:
        return existing

    # create new
    chat = DirectChat(user_a_id=current_user.id, user_b_id=data.other_user_id)
    db.add(chat)
    await db.commit()
    await db.refresh(chat)
    return chat


@router.post(
    "/create-group",
    response_model=GroupChatRead,
    status_code=status.HTTP_201_CREATED
)
async def create_group_chat(
    name: str = Form(..., max_length=50),
    description: Optional[str] = Form(None, max_length=1000),
    member_ids: List[int] = Form(...),
    room_avatar: UploadFile = File(None),
    me: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # check name uniqueness first
    existing = (await db.execute(
        select(ChatRoom).where(ChatRoom.name == name)
    )).scalar_one_or_none()
    if existing:
        raise HTTPException(400, "A chat room with that name already exists.")
    
    avatar_url: Optional[str] = None
    if room_avatar:
        contents = await room_avatar.read()
        avatar_url = upload_file_to_cloudinary(contents, folder="group_chat_avatars")

    if member_ids:
        q_valid = select(friendship.c.friend_id).where(
            and_(
                friendship.c.user_id == me.id,
                friendship.c.friend_id.in_(member_ids)
            )
        )
        result = await db.execute(q_valid)
        valid_friends = {row[0] for row in result.fetchall()}
        invalid = set(member_ids) - valid_friends
        if invalid:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot add non-friends as members: {sorted(invalid)}"
            )

    new_room = ChatRoom(
        name=name,
        description=description,
        room_avatar=avatar_url,
        created_by_id=me.id,
    )
    db.add(new_room)
    await db.flush()


    # insert members
    members = set(member_ids)
    members.add(me.id)
    await db.execute(room_members.insert().values([
        {"user_id": uid, "room_id": new_room.id} for uid in members
    ]))
    await db.commit()


    q2 = (
        select(ChatRoom)
        .options(
            joinedload(ChatRoom.created_by),
            joinedload(ChatRoom.members)
        )
        .where(ChatRoom.id == new_room.id)
    )

    result = await db.execute(q2)
    room = result.unique().scalar_one()

    return room