import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function sendFriendRequest(toUserId){
    const res = await fetchWithAuth(`${BACKEND_URL}/user/send-request`,{
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: toUserId }),
    })
    const payload = await res.json();
    if(!res.ok){
        throw new Error (`Failed to send request: ${res.status} ${res.statusText}`);
    }
    return payload
}