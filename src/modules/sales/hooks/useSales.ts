import { useQuery } from "@tanstack/react-query";
import {
  getSales,
  type GetSalesParams,
  type SalesResponse,
} from "../actions/get-sales";

export const useSales = (params: GetSalesParams = {}) => {
  return useQuery<SalesResponse>({
    queryKey: [
      "sales",
      params.offset ?? 0,
      params.limit ?? 10,
      params.customer ?? "",
      params.customer_id ?? "",
      params.start_date ?? "",
      params.end_date ?? "",
    ],
    queryFn: () => getSales(params),
  });
};
