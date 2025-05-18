import { fetchWithAuth } from "../utils/fetchWrapper";

export async function friendsList(){
    const res = await fetchWithAuth('http://localhost:8000/user/friends',{
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error("Failed to load friends");
    }
    return res.json();
}