import { fetchWithAuth } from "../utils/fetchWrapper";

export async function receivedRequestsList() {
    const res = await fetchWithAuth('http://localhost:8000/user/received-requests',{
        method: "GET",
        credentials: "include",
    });
    const payload = await res.json()
    if (!res.ok){
        throw new Error("Failed to show received Requests.");
    }
    return payload;
}