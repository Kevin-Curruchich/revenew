import { revenewApi } from "@/api/revenewApi";
import type { PaginatedResponse, PaginationParams } from "@/lib/api-types";
import type { StockMovement } from "../domain/stock-movement";

export type GetStockMovementsParams = PaginationParams;

export type StockMovementsResponse = PaginatedResponse<StockMovement>;

export const getStockMovements = async (
  productId: string,
  params: GetStockMovementsParams = {},
): Promise<StockMovementsResponse> => {
  const response = await revenewApi.get<
    StockMovementsResponse | StockMovement[]
  >(`/products/${productId}/stock-movements`, {
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });

  // Older API versions return a plain array.
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: { total: response.data.length },
    };
  }

  return response.data;
};
