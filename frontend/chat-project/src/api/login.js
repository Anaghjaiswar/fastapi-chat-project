export async function loginUser(data){
    const params = new URLSearchParams()
    params.append("username", data.email.toLowerCase());
    params.append("password", data.password);


    const res = await fetch("http://127.0.0.1:8000/auth/login",{
        method: "POST",
        credentials: "include",
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