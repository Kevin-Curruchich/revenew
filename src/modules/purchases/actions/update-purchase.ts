import { revenewApi } from "@/api/revenewApi";
import type { Purchase } from "../domain/purchase";
import type { CreatePurchaseData } from "./create-purchase";

export type UpdatePurchaseData = CreatePurchaseData;

export const updatePurchase = async (
  purchaseId: string,
  data: UpdatePurchaseData,
): Promise<Purchase> => {
  const response = await revenewApi.put<Purchase>(
    `/purchases/${purchaseId}`,
    data,
  );
  return response.data;
};
