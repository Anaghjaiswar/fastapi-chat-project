import { BACKEND_URL } from "../config/config";

export async function verifyOtp(data){
    const res = await fetch(`${BACKEND_URL}/auth/verify-otp`,{
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const payload = await res.json();
    if (!res.ok){
        throw new Error("Invalid Email or OTP.")
    }
    return payload
}