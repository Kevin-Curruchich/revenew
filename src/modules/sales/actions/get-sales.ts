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
}

export const getSales = async (
  params: GetSalesParams = {},
): Promise<SalesResponse> => {
  const { offset = 0, limit = 10 } = params;
  const response = await revenewApi.get<SalesResponse>(`/sales`, {
    params: { offset, limit },
  });
  return response.data;
};
