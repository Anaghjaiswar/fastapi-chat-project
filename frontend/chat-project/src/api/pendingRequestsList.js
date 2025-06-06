import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function pendingRequestsList() {
    const res = await fetchWithAuth(`${BACKEND_URL}/user/pending-requests`,{
        method: "GET",
        credentials: "include",
    });
    const payload = await res.json()
    if (!res.ok){
        throw new Error("Failed to show pending Requests.");
    }
    return payload;
}