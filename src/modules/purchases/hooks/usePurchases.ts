import { useQuery } from "@tanstack/react-query";
import {
  getPurchases,
  type GetPurchasesParams,
  type PurchasesResponse,
} from "../actions/get-purchases";

export const usePurchases = (params: GetPurchasesParams = {}) => {
  return useQuery<PurchasesResponse>({
    queryKey: [
      "purchases",
      params.status_filter ?? "",
      params.supplier_name ?? "",
      params.start_date ?? "",
      params.end_date ?? "",
      params.offset ?? 0,
      params.limit ?? 10,
    ],
    queryFn: () => getPurchases(params),
    staleTime: 5 * 60 * 1000,
  });
};
