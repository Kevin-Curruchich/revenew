import { useEffect, type PropsWithChildren } from "react";

import { FullPageLoader } from "@/components/ui/loading-spinner";
import { useAuthStore } from "../store/auth.store";

/**
 * Subscribes to Firebase auth once and blocks rendering until the initial
 * session has been restored. After that the router stays mounted: login and
 * logout are handled by the route guards.
 */
export const AuthBootstrap = ({ children }: PropsWithChildren) => {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitializing = useAuthStore(
    (state) => state.status === "initializing",
  );

  // Returning the unsubscribe function avoids duplicated listeners
  // (StrictMode mounts effects twice in development).
  useEffect(() => initialize(), [initialize]);

  if (isInitializing) {
    return <FullPageLoader label="Inicializando aplicación..." />;
  }

  return children;
};
