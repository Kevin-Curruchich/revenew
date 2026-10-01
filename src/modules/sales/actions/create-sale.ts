import { revenewApi } from "@/api/revenewApi";
import type { Sale } from "../domain/sale";

export interface SaleItemPayload {
  productId: string;
  quantity: number;
  unitPrice?: number;
  pricingExceptionReason?: string;
}

export type PaymentMethod = "efectivo" | "transferencia";

export interface SalePayload {
  customerId: string;
  date: string;
  items: SaleItemPayload[];
  /** Create only. Omitted, the API records the sale as paid in cash. */
  isPaymentPending?: boolean;
  /** Create only, for paid sales. */
  medioPago?: PaymentMethod;
}

export const createSale = async (data: SalePayload): Promise<Sale> => {
  const response = await revenewApi.post<Sale>("/sales", data);
  return response.data;
};
