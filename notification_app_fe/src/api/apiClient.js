// ============================================================
// API CLIENT — Axios instance configured for our backend
// All frontend API calls go through this — never direct to test server
// ============================================================

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Response Interceptor ──────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Network error";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
