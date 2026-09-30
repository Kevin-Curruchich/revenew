import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getPurchases,
  type GetPurchasesParams,
} from "../actions/get-purchases";
import { purchaseKeys } from "./query-keys";

export const usePurchases = (params: GetPurchasesParams = {}) => {
  return useQuery({
    queryKey: purchaseKeys.list(params),
    queryFn: () => getPurchases(params),
    placeholderData: keepPreviousData,
  });
};
