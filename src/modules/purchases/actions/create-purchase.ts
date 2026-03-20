import { revenewApi } from "@/api/revenewApi";
import type { Purchase } from "../domain/purchase";

export interface PurchaseItemPayload {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseData {
  supplierName: string;
  date: string;
  items: PurchaseItemPayload[];
}

export const createPurchase = async (
  data: CreatePurchaseData,
): Promise<Purchase> => {
  const response = await revenewApi.post<Purchase>("/purchases", data);
  return response.data;
};
