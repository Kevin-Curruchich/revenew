import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCustomers,
  type GetCustomersParams,
} from "../actions/get-customers";
import { customerKeys } from "./query-keys";

export const useCustomers = (params: GetCustomersParams = {}) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => getCustomers(params),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  });
};
