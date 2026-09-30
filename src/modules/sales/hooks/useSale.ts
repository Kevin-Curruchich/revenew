import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { calendarKeys } from "@/modules/calendar/hooks/useCalendarEvents";
import { customerKeys } from "@/modules/customers/hooks/query-keys";
import { dashboardKeys } from "@/modules/dashboard/hooks/useDashboardSummary";
import { followUpKeys } from "@/modules/follow-up/hooks/useFollowUps";
import { productKeys } from "@/modules/products/hooks/query-keys";
import { createSale, type SalePayload } from "../actions/create-sale";
import { getSale } from "../actions/get-sale";
import { updateSale } from "../actions/update-sale";
import { updateSalePaymentStatus } from "../actions/update-sale-payment-status";
import { saleKeys } from "./query-keys";

/**
 * A sale moves stock and feeds the purchase predictions, so everything
 * derived from sales has to be refreshed.
 */
const invalidateSaleDependents = (queryClient: QueryClient) =>
  Promise.all(
    [
      saleKeys.all,
      productKeys.all,
      customerKeys.all,
      dashboardKeys.all,
      followUpKeys.all,
      calendarKeys.all,
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );

export const useSale = (saleId: string | undefined) => {
  return useQuery({
    queryKey: saleKeys.detail(saleId ?? ""),
    queryFn: () => getSale(saleId!),
    enabled: !!saleId,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => invalidateSaleDependents(queryClient),
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SalePayload }) =>
      updateSale(id, data),
    onSuccess: () => invalidateSaleDependents(queryClient),
  });
};

export const useUpdateSalePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      isPaymentPending,
    }: {
      id: string;
      isPaymentPending: boolean;
    }) => updateSalePaymentStatus(id, { isPaymentPending }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: saleKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]),
  });
};
