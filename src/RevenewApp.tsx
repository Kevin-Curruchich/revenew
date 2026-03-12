import { useEffect, type PropsWithChildren } from "react";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { appRoute } from "./router/app.router";
import { useAuthStore } from "./modules/auth";
import { FullPageLoader } from "./components/ui/loading-spinner";

const queryClient = new QueryClient();

const CheckAuthProvider = ({ children }: PropsWithChildren) => {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    // Start listening to Firebase auth state
    initialize();
  }, [initialize]);

  // Wait for Firebase to check auth state
  if (isLoading) {
    return <FullPageLoader label="Inicializando aplicación..." />;
  }

  return <>{children}</>;
};

export const RevenewApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CheckAuthProvider>
        <RouterProvider router={appRoute} />
        <ReactQueryDevtools initialIsOpen={false} />
      </CheckAuthProvider>
    </QueryClientProvider>
  );
};
