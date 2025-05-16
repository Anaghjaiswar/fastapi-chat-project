import { fetchWithAuth } from "../utils/fetchWrapper";

export async function sendFriendRequest(toUserId){
    const res = await fetchWithAuth('http://localhost:8000/user/send-request',{
        method: "POST",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: toUserId }),
    })
    const payload = await res.json();
    if(!res.ok){
        throw new Error (`Failed to send request: ${res.status} ${res.statusText}`);
    }
    return payload
}