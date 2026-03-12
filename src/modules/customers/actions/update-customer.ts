import { revenewApi } from "@/api/revenewApi";
import type { Customer } from "../domain/customer";

export interface UpdateCustomerData {
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export const updateCustomer = async (
  customerId: string,
  data: UpdateCustomerData,
): Promise<Customer> => {
  const response = await revenewApi.put<Customer>(
    `/customers/${customerId}`,
    data,
  );
  return response.data;
};
