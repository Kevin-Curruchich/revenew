import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProduct } from "../actions/get-product";
import { createProduct, type ProductPayload } from "../actions/create-product";
import { updateProduct } from "../actions/update-product";
import { productKeys } from "./query-keys";

export const useProduct = (productId: string | undefined) => {
  return useQuery({
    queryKey: productKeys.detail(productId ?? ""),
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductPayload }) =>
      updateProduct(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
};
