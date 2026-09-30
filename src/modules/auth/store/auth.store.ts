import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { queryClient } from "@/lib/query-client";

import { getUserProfile } from "../actions/get-user-profile";
import { getAuthErrorMessage } from "../helpers/get-auth-error-message";
import type { User } from "../domain/user";

/**
 * - `initializing`: waiting for Firebase to restore the session (and the
 *   profile, if there is one). The app shows a full page loader.
 * - `authenticated`: Firebase session + backend profile loaded.
 * - `unauthenticated`: no session (or the profile could not be loaded).
 */
export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;

  /** Subscribes to Firebase auth changes. Returns the unsubscribe function. */
  initialize: () => Unsubscribe;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Both the auth listener and `login` load the profile for the same Firebase
// user; share the in-flight request so `/auth/me` is only called once.
let pendingProfileSync: { uid: string; promise: Promise<void> } | null = null;

export const useAuthStore = create<AuthState>((set) => {
  const syncProfile = (firebaseUser: FirebaseUser): Promise<void> => {
    if (pendingProfileSync?.uid === firebaseUser.uid) {
      return pendingProfileSync.promise;
    }

    const promise = getUserProfile()
      .then((user) => {
        set({ user, status: "authenticated", error: null });
      })
      .catch(async () => {
        // A Firebase session without a backend profile is unusable: end it so
        // the user can try again from the login page.
        await signOut(auth);
        set({
          user: null,
          status: "unauthenticated",
          error:
            "No se pudo cargar tu perfil. Intenta iniciar sesión de nuevo.",
        });
      })
      .finally(() => {
        pendingProfileSync = null;
      });

    pendingProfileSync = { uid: firebaseUser.uid, promise };
    return promise;
  };

  return {
    user: null,
    status: "initializing",
    error: null,

    initialize: () =>
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          void syncProfile(firebaseUser);
          return;
        }

        // Never leak cached data from one session to the next.
        queryClient.clear();
        // `error` is intentionally preserved so the login page can show why
        // the session ended.
        set({ user: null, status: "unauthenticated" });
      }),

    login: async (email, password) => {
      set({ error: null });
      try {
        const credentials = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await syncProfile(credentials.user);
      } catch (error) {
        set({ error: getAuthErrorMessage(error) });
      }
    },

    logout: async () => {
      set({ error: null });
      await signOut(auth);
    },

    clearError: () => set({ error: null }),
  };
});
