from typing import List, Dict, Set
from fastapi import WebSocket
from config import redis_client

class ConnectionManager:
    def __init__(self):
        self.active_rooms: Dict[int, Set[WebSocket]] = {}
        self.active_directs: Dict[int, Set[WebSocket]] = {}
        self.active_video_directs: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str, channel_id: int):
        await websocket.accept()
        mapping = self.active_rooms if channel=="room" else self.active_directs
        mapping.setdefault(channel_id, set()).add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str, channel_id: int):
        mapping = self.active_rooms if channel=="room" else self.active_directs
        if channel_id in mapping:
            mapping[channel_id].discard(websocket)

    async def broadcast(self, channel: str, channel_id: int, message: dict, exclude_ws: WebSocket = None):
        mapping = self.active_rooms if channel=="room" else self.active_directs
        for ws in mapping.get(channel_id, []):
            if ws != exclude_ws:
                await ws.send_json(message)

    async def broadcast_with_redis(self, channel: str, channel_id: int, message: dict):
        redis_channel = f"{channel}:{channel_id}"
        await redis_client.publish(redis_channel, message)

    async def listen_to_redis(self, channel: str, channel_id: int):
        redis_channel = f"{channel}:{channel_id}"
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(redis_channel)

        async for msg in pubsub.listen():
            if msg["type"] == "message":
                # Forward Redis message to WebSocket clients
                message = msg["data"].decode("utf-8")
                await self.broadcast(channel, channel_id, message)

    async def connect_video(self, websocket: WebSocket, channel_id: int):
        """
        A shortcut for video signaling: no separate channel string,
        we always treat it as 'video_direct'.
        """
        await websocket.accept()
        self.active_video_directs.setdefault(channel_id, set()).add(websocket)

    def disconnect_video(self, websocket: WebSocket, channel_id: int):
        if channel_id in self.active_video_directs:
            self.active_video_directs[channel_id].discard(websocket)

    async def broadcast_video(self, channel_id: int, message: dict, exclude_ws: WebSocket = None):
        """
        Send signaling message (SDP/ICE) to all other peers in this direct chat.
        """
        for ws in self.active_video_directs.get(channel_id, []):
            if ws != exclude_ws:
                await ws.send_json(message)

manager = ConnectionManager()