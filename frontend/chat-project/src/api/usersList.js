import { fetchWithAuth } from "../utils/fetchWrapper";



export async function usersList(){
    const res = await fetchWithAuth("http://localhost:8000/user/list",{
        credentials: "include",
        method: "GET",
        
    })
    const payload = await res.json()
    if (!res.ok){
        throw new Error("Failed to Fetch Users");
    }
    return payload
}