import { revenewApi } from "@/api/revenewApi";
import type { StockMovement } from "../domain/stock-movement";

export interface GetStockMovementsParams {
  limit?: number;
  offset?: number;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  meta: {
    total: number;
  };
}

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

  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: {
        total: response.data.length,
      },
    };
  }

  return response.data;
};
