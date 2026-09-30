import { revenewApi } from "@/api/revenewApi";
import type { Customer } from "../domain/customer";
import type { CustomerPayload } from "./create-customer";

export const updateCustomer = async (
  customerId: string,
  data: CustomerPayload,
): Promise<Customer> => {
  const response = await revenewApi.put<Customer>(
    `/customers/${customerId}`,
    data,
  );
  return response.data;
};
