import { revenewApi } from "@/api/revenewApi";
import type { CashSummary } from "../domain/cash";

export const getCashSummary = async (): Promise<CashSummary> => {
  const response = await revenewApi.get<CashSummary>("/cash/summary");
  return response.data;
};
