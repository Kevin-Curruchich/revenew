import { revenewApi } from "@/api/revenewApi";
import type { Sale } from "../domain/sale";

export interface SalesResponse {
  data: Sale[];
  meta: {
    total: number;
  };
}

export interface GetSalesParams {
  offset?: number;
  limit?: number;
  customer?: string;
  customer_id?: string;
  start_date?: string;
  end_date?: string;
}

export const getSales = async (
  params: GetSalesParams = {},
): Promise<SalesResponse> => {
  const {
    offset = 0,
    limit = 10,
    customer,
    customer_id,
    start_date,
    end_date,
  } = params;
  const response = await revenewApi.get<SalesResponse>(`/sales`, {
    params: {
      offset,
      limit,
      customer: customer || undefined,
      customer_id: customer_id || undefined,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
    },
  });
  return response.data;
};
