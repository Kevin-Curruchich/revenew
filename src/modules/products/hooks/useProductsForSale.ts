import { useQuery } from "@tanstack/react-query";
import {
  getProductsForSale,
  type GetProductsForSaleParams,
} from "../actions/get-products-for-sale";
import { productKeys } from "./query-keys";

export const useProductsForSale = (params: GetProductsForSaleParams = {}) => {
  return useQuery({
    queryKey: productKeys.forSale(params),
    queryFn: () => getProductsForSale(params),
  });
};
