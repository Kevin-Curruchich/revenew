import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProducts, type GetProductsParams } from "../actions/get-products";
import { productKeys } from "./query-keys";

export const useProducts = (params: GetProductsParams = {}) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
  });
};
