import axios from "axios";
import { useAuthStore } from "@/modules/auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const revenewApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in all requests
revenewApi.interceptors.request.use(
  async (config) => {
    const getToken = useAuthStore.getState().getToken;
    const token = await getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
