export async function verifyEmail(data){
    const res = await fetch("http://127.0.0.1:8000/auth/verify-email",{
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const payload = await res.json();
    if (!res.ok){
        throw new Error("Invalid Email or OTP.")
    }
    return payload
}