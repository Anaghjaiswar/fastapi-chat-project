import { BACKEND_URL } from "../config/config";
import { fetchWithAuth } from "../utils/fetchWrapper";

export async function cancelRequest(data) {
  const res = await fetchWithAuth(`${BACKEND_URL}/user/cancel-request`,
    {
      method: "DELETE",
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
