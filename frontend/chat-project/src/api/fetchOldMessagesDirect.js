// src/api/fetchOldMessagesDirect.js
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function fetchOldMessagesDirect(chatId, limit = 20, offset = 0) {
  const res = await fetchWithAuth(
    `http://localhost:8000/chat/direct/${chatId}/messages?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to fetch old messages");
  }
  
  return res.json();
}
