import axios, { isAxiosError } from "axios";
import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const revenewApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach a fresh Firebase ID token to every request. `getIdToken` returns the
// cached token and only refreshes it when it is about to expire.
revenewApi.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend rejects our credentials, end the Firebase session so the
// auth listener resets the app state and the guards send the user to /login.
revenewApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      auth.currentUser
    ) {
      await signOut(auth);
    }
    return Promise.reject(error);
  },
);
