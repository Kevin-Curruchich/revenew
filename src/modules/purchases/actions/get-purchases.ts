import { revenewApi } from "@/api/revenewApi";
import type { PaginatedResponse, PaginationParams } from "@/lib/api-types";
import type { Purchase, PurchaseStatus } from "../domain/purchase";

export interface GetPurchasesParams extends PaginationParams {
  status_filter?: PurchaseStatus;
  supplier_name?: string;
  start_date?: string;
  end_date?: string;
}

export type PurchasesResponse = PaginatedResponse<Purchase>;

export const getPurchases = async (
  params: GetPurchasesParams = {},
): Promise<PurchasesResponse> => {
  const response = await revenewApi.get<PurchasesResponse>("/purchases", {
    params: {
      status_filter: params.status_filter || undefined,
      supplier_name: params.supplier_name || undefined,
      start_date: params.start_date || undefined,
      end_date: params.end_date || undefined,
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
    },
  });

  return response.data;
};
