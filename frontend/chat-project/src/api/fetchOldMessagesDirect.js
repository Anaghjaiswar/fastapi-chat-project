// src/api/fetchOldMessagesDirect.js
import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function fetchOldMessagesDirect(chatId, limit = 20, offset = 0) {
  const res = await fetchWithAuth(
    `${BACKEND_URL}/chat/direct/${chatId}/messages?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
    }
  );
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to fetch old messages");
  }
  
  return res.json();
}
