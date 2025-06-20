import { refreshAccessToken } from '../api/refresh';

let isRefreshing = false;
let subscribers = [];

function subscribeTokenRefresh(callback) {
  subscribers.push(callback);
}

function onRefreshed() {
  subscribers.forEach((callback) => callback());
  subscribers = [];
}

export async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem("access_token");
  const { headers = {}, ...rest } = options;

  const authHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(url, {
      ...rest,
      headers: authHeaders,
      // credentials: 'include', // REMOVE this line
    });

    // If the response is unauthorized (401), attempt token refresh
    if (response.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await refreshAccessToken(); // This should update localStorage with new token
          onRefreshed();
        } catch (err) {
          console.error('Token refresh failed', err);
          throw err;
        } finally {
          isRefreshing = false;
        }
      }

      // Wait until the refresh is complete
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(() => {
          fetchWithAuth(url, {
            ...rest,
            headers: {
              ...headers,
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          })
            .then(resolve)
            .catch(reject);
        });
      });
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
