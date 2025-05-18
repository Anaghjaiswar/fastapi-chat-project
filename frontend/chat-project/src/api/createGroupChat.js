import { fetchWithAuth } from "../utils/fetchWrapper";

export async function createGroupChat(payload) {
  const res = await fetchWithAuth("http://localhost:8000/chat-rooms/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid JSON response from server.");
  }

  if (!res.ok) {
    // Server sends { detail: "…"} on error
    const msg = data.detail || "Failed to create group chat.";
    throw new Error(msg);
  }

  return data;
}
