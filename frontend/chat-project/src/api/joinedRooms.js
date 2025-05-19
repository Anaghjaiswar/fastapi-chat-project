// src/api/joinedRooms.js
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function joinedRoomsList() {
  const res = await fetchWithAuth("http://localhost:8000/user/joined-rooms", {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to load joined rooms");
  }
  return res.json();  
}
