import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function receivedRequestsList() {
    const res = await fetchWithAuth(`${BACKEND_URL}/user/received-requests`,{
        method: "GET",
    });
    const payload = await res.json()
    if (!res.ok){
        throw new Error("Failed to show received Requests.");
    }
    return payload;
}