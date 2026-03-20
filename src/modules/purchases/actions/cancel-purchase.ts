import { revenewApi } from "@/api/revenewApi";
import type { Purchase } from "../domain/purchase";

export const cancelPurchase = async (purchaseId: string): Promise<Purchase> => {
  const response = await revenewApi.post<Purchase>(
    `/purchases/${purchaseId}/cancel`,
  );
  return response.data;
};
