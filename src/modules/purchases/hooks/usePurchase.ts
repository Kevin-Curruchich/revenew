import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPurchase,
  type CreatePurchaseData,
} from "../actions/create-purchase";
import { deletePurchase } from "../actions/delete-purchase";
import { cancelPurchase } from "../actions/cancel-purchase";
import { confirmPurchase } from "../actions/confirm-purchase";
import { getPurchase } from "../actions/get-purchase";
import {
  updatePurchase,
  type UpdatePurchaseData,
} from "../actions/update-purchase";
import type { Purchase } from "../domain/purchase";

export const usePurchase = (purchaseId?: string) => {
  const queryClient = useQueryClient();

  const invalidateRelatedQueries = async (targetPurchaseId?: string) => {
    const invalidations = [
      queryClient.invalidateQueries({ queryKey: ["purchases"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["product"] }),
      queryClient.invalidateQueries({ queryKey: ["product-stock-movements"] }),
    ];

    if (targetPurchaseId) {
      invalidations.push(
        queryClient.invalidateQueries({
          queryKey: ["purchase", targetPurchaseId],
        }),
      );
    }

    await Promise.all(invalidations);
  };

  const query = useQuery<Purchase>({
    queryKey: ["purchase", purchaseId],
    queryFn: () => getPurchase(purchaseId!),
    enabled: !!purchaseId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePurchaseData) => createPurchase(data),
    onSuccess: async (purchase) => {
      await invalidateRelatedQueries(purchase.id);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      purchaseId: targetPurchaseId,
      data,
    }: {
      purchaseId: string;
      data: UpdatePurchaseData;
    }) => updatePurchase(targetPurchaseId, data),
    onSuccess: async (_, variables) => {
      await invalidateRelatedQueries(variables.purchaseId);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (targetPurchaseId: string) => confirmPurchase(targetPurchaseId),
    onSuccess: async (purchase) => {
      await invalidateRelatedQueries(purchase.id);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (targetPurchaseId: string) => cancelPurchase(targetPurchaseId),
    onSuccess: async (purchase) => {
      await invalidateRelatedQueries(purchase.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (targetPurchaseId: string) => deletePurchase(targetPurchaseId),
    onSuccess: async (_, targetPurchaseId) => {
      await invalidateRelatedQueries(targetPurchaseId);
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createPurchase: createMutation.mutateAsync,
    updatePurchase: updateMutation.mutateAsync,
    confirmPurchase: confirmMutation.mutateAsync,
    cancelPurchase: cancelMutation.mutateAsync,
    deletePurchase: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
