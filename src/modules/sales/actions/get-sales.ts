import { revenewApi } from "@/api/revenewApi";
import type { PaginatedResponse, PaginationParams } from "@/lib/api-types";
import type { Sale } from "../domain/sale";

export type SalesResponse = PaginatedResponse<Sale>;

export interface GetSalesParams extends PaginationParams {
  customer?: string;
  customer_id?: string;
  start_date?: string;
  end_date?: string;
}

export const getSales = async (
  params: GetSalesParams = {},
): Promise<SalesResponse> => {
  const response = await revenewApi.get<SalesResponse>("/sales", {
    params: {
      offset: params.offset ?? 0,
      limit: params.limit ?? 10,
      customer: params.customer || undefined,
      customer_id: params.customer_id || undefined,
      start_date: params.start_date || undefined,
      end_date: params.end_date || undefined,
    },
  });
  return response.data;
};
