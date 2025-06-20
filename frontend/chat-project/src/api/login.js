import { BACKEND_URL } from "../config/config";

export async function loginUser(data){
    const params = new URLSearchParams()
    params.append("username", data.email.toLowerCase());
    params.append("password", data.password);

    const res = await fetch(`${BACKEND_URL}/auth/login`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });

    const payload = await res.json()
    if(!res.ok){
        throw new Error (payload.detail || payload.message || "Login Failed");
    }
    return payload;
}