import { useQuery } from "@tanstack/react-query";
import {
  getProfitReport,
  type GetProfitReportParams,
  type ProfitReportResponse,
} from "../actions/get-profit-report";

export const useProfitReport = (params: GetProfitReportParams) => {
  return useQuery<ProfitReportResponse>({
    queryKey: [
      "sales-profit-report",
      params.group_by,
      params.start_date ?? "",
      params.end_date ?? "",
      params.limit ?? 100,
    ],
    queryFn: () => getProfitReport(params),
  });
};
