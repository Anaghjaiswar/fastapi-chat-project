from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from database import get_db
from dependencies import get_current_user
from models import Message, ChatRoom, DirectChat
from connection_manager import manager


router = APIRouter()

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
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # authorize: ensure user is part of this direct chat
    result = await db.execute(select(DirectChat).filter(DirectChat.id==chat_id))
    chat = result.scalars().first()
    if not chat or current_user.id not in (chat.user_a_id, chat.user_b_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, "direct", chat_id)
    try:
        while True:
            data = await websocket.receive_json()
            msg = await save_message(
                db, current_user.id, data["content"], "direct", chat_id, data.get("type","text")
            )
            await manager.broadcast("direct", chat_id, {
                "id": msg.id,
                "direct_chat_id": chat_id,
                "sender_id": current_user.id,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat()
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket, "direct", chat_id)

