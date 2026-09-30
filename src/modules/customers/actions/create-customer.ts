import { revenewApi } from "@/api/revenewApi";
import type { Customer } from "../domain/customer";

export interface CustomerPayload {
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

export const createCustomer = async (
  data: CustomerPayload,
): Promise<Customer> => {
  const response = await revenewApi.post<Customer>("/customers", data);
  return response.data;
};
