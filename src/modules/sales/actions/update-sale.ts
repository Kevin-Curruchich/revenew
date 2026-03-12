import { revenewApi } from "@/api/revenewApi";
import type { Sale } from "../domain/sale";
import type { CreateSaleData } from "./create-sale";

export interface UpdateSaleData extends CreateSaleData {}

export const updateSale = async (
  saleId: string,
  data: UpdateSaleData,
): Promise<Sale> => {
  const response = await revenewApi.put<Sale>(`/sales/${saleId}`, data);
  return response.data;
};
