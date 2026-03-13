import { revenewApi } from "@/api/revenewApi";
import type { DashboardSummary } from "../domain/dashboard-summary";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await revenewApi.get<DashboardSummary>("/dashboard/summary");
  return response.data;
};
