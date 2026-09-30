import type { GetProfitReportParams } from "../actions/get-profit-report";
import type { GetSalesParams } from "../actions/get-sales";

export const saleKeys = {
  all: ["sales"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (params: GetSalesParams) => [...saleKeys.lists(), params] as const,
  detail: (id: string) => [...saleKeys.all, "detail", id] as const,
  profitReport: (params: GetProfitReportParams) =>
    [...saleKeys.all, "profit-report", params] as const,
};
