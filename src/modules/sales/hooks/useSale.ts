import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSale } from "../actions/get-sale";
import { createSale, type CreateSaleData } from "../actions/create-sale";
import { updateSale, type UpdateSaleData } from "../actions/update-sale";
import type { SalesResponse } from "../actions/get-sales";
import {
  updateSalePaymentStatus,
  type UpdateSalePaymentStatusData,
} from "../actions/update-sale-payment-status";
import type { Sale } from "../domain/sale";

export const useSale = (saleId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<Sale>({
    queryKey: ["sale", saleId],
    queryFn: () => getSale(saleId!),
    enabled: !!saleId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSaleData) => createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ saleId, data }: { saleId: string; data: UpdateSaleData }) =>
      updateSale(saleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sale", variables.saleId] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({
      saleId,
      data,
    }: {
      saleId: string;
      data: UpdateSalePaymentStatusData;
    }) => updateSalePaymentStatus(saleId, data),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Sale>(
        ["sale", variables.saleId],
        (currentSale) =>
          currentSale
            ? {
                ...currentSale,
                is_payment_pending: variables.data.isPaymentPending,
              }
            : currentSale,
      );

      queryClient.setQueriesData<SalesResponse>(
        { queryKey: ["sales"] },
        (currentSales) =>
          currentSales
            ? {
                ...currentSales,
                data: currentSales.data.map((sale) =>
                  sale.id === variables.saleId
                    ? {
                        ...sale,
                        is_payment_pending: variables.data.isPaymentPending,
                      }
                    : sale,
                ),
              }
            : currentSales,
      );

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sale", variables.saleId] }),
        queryClient.invalidateQueries({
          queryKey: ["sales"],
          refetchType: "all",
        }),
      ]);
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createSale: createMutation.mutateAsync,
    updateSale: updateMutation.mutateAsync,
    updateSalePaymentStatus: updatePaymentStatusMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingPaymentStatus: updatePaymentStatusMutation.isPending,
  };
};
