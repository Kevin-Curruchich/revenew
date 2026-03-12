import { revenewApi } from "@/api/revenewApi";
import type { Customer } from "../domain/customer";

export interface GetCustomerParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface CustomersResponse {
  data: Customer[];
  meta: {
    total: number;
  };
}

export const getClients = async (
  params: GetCustomerParams = {
    offset: 0,
    limit: 10,
    search: "",
  },
): Promise<CustomersResponse> => {
  const response = await revenewApi.get<CustomersResponse>("/customers", {
    params,
  });
  return response.data;
};
