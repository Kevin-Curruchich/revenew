import { revenewApi } from "@/api/revenewApi";

export type ProfitReportGroupBy = "sale" | "customer" | "product";

export interface GetProfitReportParams {
  group_by: ProfitReportGroupBy;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export interface ProfitReportItem {
  key: string;
  label: string;
  quantity: number;
  revenue: number;
  gross_profit: number;
}

export interface ProfitReportResponse {
  data: ProfitReportItem[];
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
