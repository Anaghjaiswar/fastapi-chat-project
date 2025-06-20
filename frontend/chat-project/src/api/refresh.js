import { BACKEND_URL } from "../config/config";

export async function refreshAccessToken() {
  const refresh_token = localStorage.getItem("refresh_token");
  const response = await fetch(`${BACKEND_URL}/auth/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }), // send token in body
    // credentials: 'include', // REMOVE THIS LINE
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.detail || payload.message || 'Token refresh failed');
  }
  return payload.access_token; // new JWT
}
