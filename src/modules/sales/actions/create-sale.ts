import { revenewApi } from "@/api/revenewApi";
import type { Sale } from "../domain/sale";

export interface SaleItemPayload {
  productId: string;
  quantity: number;
  unitPrice?: number;
  pricingExceptionReason?: string;
}

export interface SalePayload {
  customerId: string;
  date: string;
  items: SaleItemPayload[];
}

export const createSale = async (data: SalePayload): Promise<Sale> => {
  const response = await revenewApi.post<Sale>("/sales", data);
  return response.data;
};
