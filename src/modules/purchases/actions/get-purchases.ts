import { revenewApi } from "@/api/revenewApi";
import type { Purchase } from "../domain/purchase";

export interface GetPurchasesParams {
  status_filter?: string;
  supplier_name?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface PurchasesResponse {
  data: Purchase[];
  meta: {
    total: number;
  };
}

export const getPurchases = async (
  params: GetPurchasesParams = {},
): Promise<PurchasesResponse> => {
  const response = await revenewApi.get<PurchasesResponse>("/purchases", {
    params: {
      status_filter: params.status_filter,
      supplier_name: params.supplier_name,
      start_date: params.start_date,
      end_date: params.end_date,
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
    },
  });

  return response.data;
};
