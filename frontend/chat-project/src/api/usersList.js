import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";



export async function usersList(){
    const res = await fetchWithAuth(`${BACKEND_URL}/user/list`,{
        credentials: "include",
        method: "GET",
        
    })
    const payload = await res.json()
    if (!res.ok){
        throw new Error("Failed to Fetch Users");
    }
    return payload
}