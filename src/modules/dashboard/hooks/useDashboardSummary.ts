import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../actions/get-dashboard-summary";
import type { DashboardSummary } from "../domain/dashboard-summary";

export const useDashboardSummary = () => {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
