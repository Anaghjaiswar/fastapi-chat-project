import { fetchWithAuth } from "../utils/fetchWrapper";

export async function acceptRequest(data){
    const res = await fetchWithAuth('http://localhost:8000/user/accept-request', {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    })
    const payload = await res.json();
    if (!res.ok){
        throw new Error("Failed to accept request.")
    }
    return payload
}