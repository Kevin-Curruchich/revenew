import { Navigate, Outlet, useLocation, type Location } from "react-router";
import { useAuthStore } from "../store/auth.store";

/** Only lets authenticated users through; everyone else goes to /login. */
export const AuthGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.user !== null);
  const location = useLocation();

  if (!isAuthenticated) {
    // Remember where the user was going so we can send them back after login.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

/** Prevents authenticated users from seeing the login page. */
export const LoginGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.user !== null);
  const location = useLocation();

  if (isAuthenticated) {
    const from = (location.state as { from?: Location } | null)?.from;
    const redirectTo = from ? `${from.pathname}${from.search}` : "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
