import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProduct } from "../actions/get-product";
import {
  createProduct,
  type CreateProductData,
} from "../actions/create-product";
import {
  updateProduct,
  type UpdateProductData,
} from "../actions/update-product";
import type { Product } from "../domain/product";

export const useProduct = (productId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductData) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateProductData;
    }) => updateProduct(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
