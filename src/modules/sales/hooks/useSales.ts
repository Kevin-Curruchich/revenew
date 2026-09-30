import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getSales, type GetSalesParams } from "../actions/get-sales";
import { saleKeys } from "./query-keys";

export const useSales = (params: GetSalesParams = {}) => {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => getSales(params),
    placeholderData: keepPreviousData,
  });
};
