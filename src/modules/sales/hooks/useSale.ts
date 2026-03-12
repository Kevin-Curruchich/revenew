import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSale } from "../actions/get-sale";
import { createSale, type CreateSaleData } from "../actions/create-sale";
import { updateSale, type UpdateSaleData } from "../actions/update-sale";
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

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createSale: createMutation.mutateAsync,
    updateSale: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
