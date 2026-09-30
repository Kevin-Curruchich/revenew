import { revenewApi } from "@/api/revenewApi";
import type { Sale } from "../domain/sale";
import type { SalePayload } from "./create-sale";

export const updateSale = async (
  saleId: string,
  data: SalePayload,
): Promise<Sale> => {
  const response = await revenewApi.put<Sale>(`/sales/${saleId}`, data);
  return response.data;
};
