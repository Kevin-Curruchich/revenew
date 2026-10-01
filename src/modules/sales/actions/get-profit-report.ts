import { revenewApi } from "@/api/revenewApi";

export type ProfitReportGroupBy = "sale" | "customer" | "product";

export interface GetProfitReportParams {
  group_by: ProfitReportGroupBy;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

// Decimals arrive as strings from the API.
type Decimal = number | string;

export interface ProfitReportItem {
  /** Id of the sale, customer or product, depending on `group_by`. */
  key: string;
  label: string;
  quantity: Decimal;
  revenue: Decimal;
  gross_profit: Decimal;
}

export interface ProfitReportTotals {
  quantity: Decimal;
  revenue: Decimal;
  gross_profit: Decimal;
}

export interface ProfitReportResponse {
  /** Sorted by gross profit, highest first. */
  data: ProfitReportItem[];
  /** Over every row, even those cut by `limit`. */
  totals?: ProfitReportTotals;
}

export const getProfitReport = async (
  params: GetProfitReportParams,
): Promise<ProfitReportResponse> => {
  const response = await revenewApi.get<ProfitReportResponse>(
    "/sales/reports/profit",
    {
      params: {
        ...params,
        limit: params.limit ?? 100,
      },
    },
  );

  return response.data;
};
