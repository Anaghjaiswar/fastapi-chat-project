import { refreshAccessToken } from './api/refresh';

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
  const { headers = {}, ...rest } = options;

  try {
    const response = await fetch(url, {
      ...rest,
      headers,
      credentials: 'include', // Include cookies (important for HttpOnly cookies)
    });

    // If the response is unauthorized (401), attempt token refresh
    if (response.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await refreshAccessToken(); // Refresh token using a cookie-based refresh endpoint
          onRefreshed(); // Notify other requests
        } catch (err) {
          console.error('Token refresh failed', err);
          throw err; // Fail the request if refresh fails
        } finally {
          isRefreshing = false;
        }
      }

      // Wait until the refresh is complete
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(() => {
          fetchWithAuth(url, {
            ...rest,
            headers,
            credentials: 'include',
          })
            .then(resolve)
            .catch(reject);
        });
      });
    }

    return response; // If not 401, return the original response
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
