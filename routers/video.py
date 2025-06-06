from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import DirectChat, friendship
from connection_manager import manager
from routers.chat import get_current_user_ws  # your existing helper

router = APIRouter()

@router.websocket("/ws/video/{chat_id}/{user_id}")
async def video_signaling(
    websocket: WebSocket,
    chat_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    WebSocket endpoint for video signaling in a direct chat.
    - chat_id: the direct chat ID
    - user_id: ID of the connecting user (for auth)
    """
    # 1) Authenticate user via cookie-based JWT
    user = await get_current_user_ws(websocket, db)
    if not user or user.id != user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2) Ensure the user belongs to the DirectChat
    result = await db.execute(select(DirectChat).filter(DirectChat.id == chat_id))
    chat = result.scalars().first()
    if not chat or user.id not in (chat.user_a_id, chat.user_b_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 3) Ensure friendship (extra security, though if chat exists, they should be friends)
    other_user_id = chat.user_b_id if user.id == chat.user_a_id else chat.user_a_id
    friend_check = await db.execute(
        select(friendship).where(
            (friendship.c.user_id == user.id) & (friendship.c.friend_id == other_user_id)
        )
    )
    if not friend_check.first():
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 4) All checks passed → accept connection and register it
    await manager.connect_video(websocket, chat_id)

    try:
        while True:
            data = await websocket.receive_json()
            # data is expected to be a signaling payload, e.g.:
            # { "type": "offer", "sdp": "...", "to": other_user_id }
            # or { "type": "ice-candidate", "candidate": {...}, "to": other_user_id }
            to_user = data.get("to")
            if to_user is None:
                # If no "to" field, just broadcast to everyone else in chat_id
                await manager.broadcast_video(chat_id, data, exclude_ws=websocket)
            else:
                # Filter to only send to the target peer
                # We don't store user_id → websocket mapping, so we broadcast to all
                # and each client decides if the "to" matches themselves.
                await manager.broadcast_video(chat_id, data, exclude_ws=websocket)
    except WebSocketDisconnect:
        manager.disconnect_video(websocket, chat_id)
