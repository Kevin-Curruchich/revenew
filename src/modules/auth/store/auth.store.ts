import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { User } from "@/types/user";

import { getUserProfile } from "../actions/get-user-profile";

interface AuthState {
  user: User | null;
  error: string | null;
  isLoading: boolean; // For Firebase initialization and auth operations
  isFetchingProfile: boolean; // Track profile fetch to prevent duplicates

  // Computed properties (derived from state)
  isAuthenticated: () => boolean;

  // Actions
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  user: null,
  error: null,
  isLoading: true, // For Firebase initialization
  isFetchingProfile: false,

  // Computed properties
  isAuthenticated: () => get().user !== null,

  setError: (error) => set({ error }),

  initialize: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Prevent duplicate profile fetches
        const { isFetchingProfile } = get();

        if (isFetchingProfile) {
          return;
        }

        // User is signed in - fetch profile
        set({ isFetchingProfile: true, isLoading: true });

        try {
          const profile = await getUserProfile();

          if (!profile) {
            set({
              user: null,
              isLoading: false,
              isFetchingProfile: false,
              error: "Failed to fetch user profile",
            });
            return;
          }

          set({
            user: profile,
            isLoading: false,
            isFetchingProfile: false,
            error: null,
          });
        } catch (err) {
          set({
            user: null,
            isLoading: false,
            isFetchingProfile: false,
            error: "Failed to fetch user profile",
          });
        }
      } else {
        // User is signed out - ensure loading is false
        set({
          user: null,
          isLoading: false,
          isFetchingProfile: false,
          error: null,
        });
      }
    });
  },

  // Remove manual token storage from login
  login: async (email, password) => {
    try {
      set({ error: null });
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Login failed" });
      throw err;
    }
  },

  // Get fresh tokens when needed (for API calls)
  getToken: async () => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  },

  logout: async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle the state reset
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Logout failed" });
    }
  },
}));
