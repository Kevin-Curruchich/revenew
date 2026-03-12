import { useAuthStore } from "../store/auth.store";

export const useAuth = () => {
  const {
    user,
    isAuthenticated: isAuthenticatedFn,
    error,
    login,
    logout,
    setError,
  } = useAuthStore();

  const clearError = () => setError(null);
  const isAuthenticated = isAuthenticatedFn();

  return {
    user,
    isAuthenticated,
    error,
    login,
    logout,
    setError,
    clearError,
  };
};
