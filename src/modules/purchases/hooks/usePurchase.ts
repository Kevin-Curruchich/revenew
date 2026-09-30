import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { productKeys } from "@/modules/products/hooks/query-keys";
import { dashboardKeys } from "@/modules/dashboard/hooks/useDashboardSummary";
import { cancelPurchase } from "../actions/cancel-purchase";
import { confirmPurchase } from "../actions/confirm-purchase";
import {
  createPurchase,
  type PurchasePayload,
} from "../actions/create-purchase";
import { deletePurchase } from "../actions/delete-purchase";
import { getPurchase } from "../actions/get-purchase";
import { updatePurchase } from "../actions/update-purchase";
import { purchaseKeys } from "./query-keys";

/** Purchases change stock, so products must be refreshed too. */
const invalidatePurchaseDependents = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
    queryClient.invalidateQueries({ queryKey: productKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]);

export const usePurchase = (purchaseId: string | undefined) => {
  return useQuery({
    queryKey: purchaseKeys.detail(purchaseId ?? ""),
    queryFn: () => getPurchase(purchaseId!),
    enabled: !!purchaseId,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPurchase,
    onSuccess: () => invalidatePurchaseDependents(queryClient),
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchasePayload }) =>
      updatePurchase(id, data),
    onSuccess: () => invalidatePurchaseDependents(queryClient),
  });
};

export const useConfirmPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmPurchase,
    onSuccess: () => invalidatePurchaseDependents(queryClient),
  });
};

export const useCancelPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPurchase,
    onSuccess: () => invalidatePurchaseDependents(queryClient),
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePurchase,
    onSuccess: (_, purchaseId) => {
      queryClient.removeQueries({ queryKey: purchaseKeys.detail(purchaseId) });
      return invalidatePurchaseDependents(queryClient);
    },
  });
};
