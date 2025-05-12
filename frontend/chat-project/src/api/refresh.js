export async function refreshAccessToken(data) {
  const response = await fetch('http://127.0.0.1:8000/auth/token/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // will attach HttpOnly refresh cookie if present
    body: JSON.stringify(data)
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.detail || payload.message || 'Token refresh failed');
  }
  return payload.access_token; // new JWT
}
