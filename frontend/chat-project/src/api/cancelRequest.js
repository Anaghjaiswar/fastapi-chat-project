import { fetchWithAuth } from "../utils/fetchWrapper";

export async function cancelRequest(data) {
  const res = await fetchWithAuth("http://localhost:8000/user/cancel-request",
    {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.detail || "Failed to cancel request.");
  }
  return payload;
}
