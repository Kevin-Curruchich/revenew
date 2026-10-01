import { revenewApi } from "@/api/revenewApi";
import type { PaginatedResponse, PaginationParams } from "@/lib/api-types";
import type { Sale } from "../domain/sale";

export type SalesResponse = PaginatedResponse<Sale> & {
  meta: {
    /** Sum of `total` over every sale matching the filters (decimal string). */
    total_amount?: string;
  };
};

export interface GetSalesParams extends PaginationParams {
  customer?: string;
  customer_id?: string;
  product_id?: string;
  /** "true" = pendientes de pago, "false" = pagadas; vacio = todas. */
  is_payment_pending?: string;
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
      product_id: params.product_id || undefined,
      is_payment_pending: params.is_payment_pending || undefined,
      start_date: params.start_date || undefined,
      end_date: params.end_date || undefined,
    },
  });
  return response.data;
};
