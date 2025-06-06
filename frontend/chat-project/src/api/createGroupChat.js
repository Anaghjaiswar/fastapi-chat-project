// src/api/createGroupChat.js
import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function createGroupChat({ name, description, room_avatar, member_ids }) {
  const form = new FormData();
  form.append("name", name);
  form.append("description", description || "");
  member_ids.forEach((id) => form.append("member_ids", id));
  if (room_avatar) {
    // room_avatar is a File object
    form.append("room_avatar", room_avatar);
  }

  const res = await fetchWithAuth(`${BACKEND_URL}/chat/create-group`, {
    method: "POST",
    credentials: "include",
    // **Remove** the Content-Type header! Let the browser set multipart boundaries
    body: form,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid JSON response from server.");
  }

  if (!res.ok) {
    const msg = data.detail || "Failed to create group chat.";
    throw new Error(msg);
  }

  return data;
}
