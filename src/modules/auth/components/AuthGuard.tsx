import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "..";
import { FullPageLoader } from "@/components/ui/loading-spinner";

export const AuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <FullPageLoader label="Verificando autenticación..." />;
  }

  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

// Prevent authenticated users from accessing login page
export const LoginGuard = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <FullPageLoader label="Iniciando..." />;
  }

  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
