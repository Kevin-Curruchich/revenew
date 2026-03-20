import { revenewApi } from "@/api/revenewApi";
import type { Purchase } from "../domain/purchase";

export const confirmPurchase = async (
  purchaseId: string,
): Promise<Purchase> => {
  const response = await revenewApi.post<Purchase>(
    `/purchases/${purchaseId}/confirm`,
  );
  return response.data;
};
