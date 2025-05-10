import asyncio
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from database import get_db
from dependencies import get_current_user
from models import Message, ChatRoom, DirectChat, User
from connection_manager import manager
from schemas import DirectChatRead, DirectChatCreate, GroupChatRead
from config import JWT_SECRET_KEY


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
    result = await db.execute(select(DirectChat).filter(DirectChat.id==chat_id))
    chat = result.scalars().first()
    if not chat or user.id not in (chat.user_a_id, chat.user_b_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, "direct", chat_id)
    asyncio.create_task(manager.listen_to_redis("direct", chat_id))
    try:
        while True:
            data = await websocket.receive_json()
            msg = await save_message(
                db, user.id, data["content"], "direct", chat_id, data.get("type","text")
            )
            await manager.broadcast("direct", chat_id, {
                "id": msg.id,
                "direct_chat_id": chat_id,
                "sender_id": user.id,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat()
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
    
     # see if chat already exists (either ordering)
    q = await db.execute(
        select(DirectChat).filter(
            (DirectChat.user_a_id == current_user.id) & (DirectChat.user_b_id == data.other_user_id)
            |
            (DirectChat.user_a_id == data.other_user_id) & (DirectChat.user_b_id == current_user.id)
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


# @router.post('/create-group-chat', response_model=GroupChatRead, status_code=status.HTTP_200_OK)
# async def create_group_chat(data: )