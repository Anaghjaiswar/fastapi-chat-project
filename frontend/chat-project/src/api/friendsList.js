import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function friendsList(){
    const res = await fetchWithAuth(`${BACKEND_URL}/user/friends ` ,{
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error("Failed to load friends");
    }
    return res.json();
}