import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function createDirectChat(data){
    const res = await fetchWithAuth(`${BACKEND_URL}/chat/create-direct-chat`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ other_user_id: data.id }),
    });

    const payload = await res.json();
    if (!res.ok) {
        throw new Error("failed to create direct chat");
    }
    return payload
}
