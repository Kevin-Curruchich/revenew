import { revenewApi } from "@/api/revenewApi";
import type { Customer } from "../domain/customer";

export const getCustomer = async (id: string): Promise<Customer> => {
  const response = await revenewApi.get<Customer>(`/customers/${id}`);
  return response.data;
};
