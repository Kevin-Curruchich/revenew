import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
  type ProductsResponse,
  type GetProductsParams,
} from "../actions/get-products";

export const useProducts = (params: GetProductsParams = {}) => {
  return useQuery<ProductsResponse>({
    queryKey: [
      "products",
      params.offset ?? 0,
      params.limit ?? 10,
      params.search ?? "",
    ],
    queryFn: () => getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
