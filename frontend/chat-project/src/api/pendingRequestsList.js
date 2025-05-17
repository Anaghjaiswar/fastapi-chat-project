import { fetchWithAuth } from "../utils/fetchWrapper";

export async function pendingRequestsList() {
    const res = await fetchWithAuth('http://localhost:8000/user/pending-requests',{
        method: "GET",
        credentials: "include",
    });
    const payload = await res.json()
    if (!res.ok){
        throw new Error("Failed to show pending Requests.");
    }
    return payload;
}