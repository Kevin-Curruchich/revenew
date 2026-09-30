import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      // Retrying 4xx responses (404, 403, validation...) never helps.
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response) {
          const { status } = error.response;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < MAX_RETRIES;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
