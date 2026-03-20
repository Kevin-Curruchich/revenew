import { revenewApi } from "@/api/revenewApi";
import type { Purchase } from "../domain/purchase";

export const getPurchase = async (purchaseId: string): Promise<Purchase> => {
  const response = await revenewApi.get<Purchase>(`/purchases/${purchaseId}`);
  return response.data;
};
