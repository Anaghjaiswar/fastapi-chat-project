import { BACKEND_URL } from "../config/config";

export async function registerUser(data){
    console.log("data: ", data);
    const res = await fetch(`${BACKEND_URL}/user/register`,{
        method: "POST",
       
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)  
    })
    console.log("response:", res);

    const payload = await res.json()
    console.log("payload: ", payload);
    if (!res.ok) {
        throw new Error(payload.detail || payload.message || "Registration Failed")
    }
    return payload;
}