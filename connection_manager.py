from typing import List, Dict, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_rooms: Dict[int, Set[WebSocket]] = {}
        self.active_directs: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str, channel_id: int):
        await websocket.accept()
        mapping = self.active_rooms if channel=="room" else self.active_directs
        mapping.setdefault(channel_id, set()).add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str, channel_id: int):
        mapping = self.active_rooms if channel=="room" else self.active_directs
        if channel_id in mapping:
            mapping[channel_id].discard(websocket)

    async def broadcast(self, channel: str, channel_id: int, message: dict):
        mapping = self.active_rooms if channel=="room" else self.active_directs
        for ws in mapping.get(channel_id, []):
            await ws.send_json(message)

manager = ConnectionManager()