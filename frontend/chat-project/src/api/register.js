export async function registerUser(data){
    const res = await fetch("http://127.0.0.1:8000/user/register",{
        method: "POST",
        // credentials: "include",
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