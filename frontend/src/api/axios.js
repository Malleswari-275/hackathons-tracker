import axios from "axios";
import { store } from "@/store";
import { clearAuth } from "@/store/authSlice";

// In dev, "/api" is proxied to the backend by Vite. In production (frontend on
// Cloudflare Pages, backend on EC2), set VITE_API_URL to the full API base, e.g.
// https://api.example.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor — inject auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearAuth());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
