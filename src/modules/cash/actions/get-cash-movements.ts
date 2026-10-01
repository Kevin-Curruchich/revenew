import { revenewApi } from "@/api/revenewApi";
import type { PaginatedResponse, PaginationParams } from "@/lib/api-types";
import type { CashMovement } from "../domain/cash";

export interface GetCashMovementsParams extends PaginationParams {
  start_date?: string;
  end_date?: string;
}

export type CashMovementsResponse = PaginatedResponse<CashMovement>;

/** Newest first; each row carries the balance it left. */
export const getCashMovements = async (
  params: GetCashMovementsParams = {},
): Promise<CashMovementsResponse> => {
  const response = await revenewApi.get<CashMovementsResponse>(
    "/cash/movements",
    {
      params: {
        start_date: params.start_date || undefined,
        end_date: params.end_date || undefined,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    },
  );
  return response.data;
};
