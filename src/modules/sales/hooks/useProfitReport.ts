import { useQuery } from "@tanstack/react-query";
import {
  getProfitReport,
  type GetProfitReportParams,
} from "../actions/get-profit-report";
import { saleKeys } from "./query-keys";

export const useProfitReport = (params: GetProfitReportParams) => {
  return useQuery({
    queryKey: saleKeys.profitReport(params),
    queryFn: () => getProfitReport(params),
  });
};
