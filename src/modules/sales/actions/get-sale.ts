import { revenewApi } from "@/api/revenewApi";
import type { Sale } from "../domain/sale";

export const getSale = async (saleId: string): Promise<Sale> => {
  const response = await revenewApi.get<Sale>(`/sales/${saleId}`);
  return response.data;
};
