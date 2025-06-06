// src/api/joinedRooms.js
import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function joinedRoomsList() {
  const res = await fetchWithAuth(`${BACKEND_URL}/user/joined-rooms`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to load joined rooms");
  }
  return res.json();  
}
