export async function verifyOtp(data){
    const res = await fetch("http://localhost:8000/auth/verify-otp",{
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include",
    });

    const payload = await res.json();
    if (!res.ok){
        throw new Error("Invalid Email or OTP.")
    }
    return payload
}