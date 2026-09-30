import { revenewApi } from "@/api/revenewApi";
import type { PaginatedResponse, PaginationParams } from "@/lib/api-types";
import type { Customer } from "../domain/customer";

export interface GetCustomersParams extends PaginationParams {
  search?: string;
}

export type CustomersResponse = PaginatedResponse<Customer>;

export const getCustomers = async (
  params: GetCustomersParams = {},
): Promise<CustomersResponse> => {
  const response = await revenewApi.get<CustomersResponse>("/customers", {
    params: {
      offset: params.offset ?? 0,
      limit: params.limit ?? 10,
      search: params.search || undefined,
    },
  });
  return response.data;
};
