import { useMutation, useQueryClient } from "@tanstack/react-query";

import { dashboardKeys } from "@/modules/dashboard/hooks/useDashboardSummary";
import { createCashMovement } from "../actions/create-cash-movement";
import { cashKeys } from "./query-keys";

export const useCreateCashMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCashMovement,
    onSuccess: () =>
      Promise.all(
        [cashKeys.all, dashboardKeys.all].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
};
