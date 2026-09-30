import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../actions/get-dashboard-summary";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: getDashboardSummary,
  });
};
