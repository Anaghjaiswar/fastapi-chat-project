import { fetchWithAuth } from "../utils/fetchWrapper";

export const searchUsers = async (query) => {
  try {
    const url = `http://localhost:8000/user/search?query=${encodeURIComponent(query)}`;
    const res = await fetchWithAuth(url, {
        method: "GET",
        credentials: "include"
    });
    if (!res.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error("Failed to fetch search results. Please try again later.");
  }
};