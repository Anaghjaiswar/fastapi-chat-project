export async function sendVerificationMail(data){
    const res = await fetch("http://localhost:8000/auth/send-otp", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    console.log("res: ", res);

    const payload = await res.json();
    if (res.status === 404){
        throw new Error("Please use the same email from which you registered your account");   
    }
    if (res .status === 400){
        throw new Error("You are already verified")
    }
    if (!res.ok) {
        throw new Error(payload.detail || payload.message || "failed to send mail")
    }

    return payload
}