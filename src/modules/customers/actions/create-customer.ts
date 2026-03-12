import { revenewApi } from "@/api/revenewApi";
import type { Customer } from "../domain/customer";

export interface CreateCustomerData {
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export const createCustomer = async (
  data: CreateCustomerData,
): Promise<Customer> => {
  const response = await revenewApi.post<Customer>("/customers", data);
  return response.data;
};
