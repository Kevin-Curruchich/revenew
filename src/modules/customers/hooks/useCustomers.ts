import { useQuery } from "@tanstack/react-query";
import {
  getClients,
  type CustomersResponse,
  type GetCustomerParams,
} from "../actions/get-clients";

export const useCustomers = (params: GetCustomerParams = {}) => {
  return useQuery<CustomersResponse>({
    queryKey: [
      "clients",
      params.offset ?? 0,
      params.limit ?? 10,
      params.search ?? "",
    ],
    queryFn: () => getClients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
