import { revenewApi } from "@/api/revenewApi";
import type { Purchase } from "../domain/purchase";

export interface PurchaseItemPayload {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface PurchasePayload {
  supplierName: string;
  date: string;
  items: PurchaseItemPayload[];
}

export const createPurchase = async (
  data: PurchasePayload,
): Promise<Purchase> => {
  const response = await revenewApi.post<Purchase>("/purchases", data);
  return response.data;
};
