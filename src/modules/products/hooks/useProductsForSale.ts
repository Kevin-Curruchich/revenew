import { useQuery } from "@tanstack/react-query";
import {
  getProductsForSale,
  type GetProductsForSaleParams,
  type ProductsForSaleResponse,
} from "../actions/get-products-for-sale";

export const useProductsForSale = (params: GetProductsForSaleParams = {}) => {
  return useQuery<ProductsForSaleResponse>({
    queryKey: [
      "productsForSale",
      params.offset ?? 0,
      params.limit ?? 50,
      params.search ?? "",
    ],
    queryFn: () => getProductsForSale(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
