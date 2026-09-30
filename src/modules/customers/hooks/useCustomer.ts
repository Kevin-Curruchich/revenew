import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomer } from "../actions/get-customer";
import {
  createCustomer,
  type CustomerPayload,
} from "../actions/create-customer";
import { updateCustomer } from "../actions/update-customer";
import { customerKeys } from "./query-keys";

export const useCustomer = (customerId: string | undefined) => {
  return useQuery({
    queryKey: customerKeys.detail(customerId ?? ""),
    queryFn: () => getCustomer(customerId!),
    enabled: !!customerId,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() }),
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerPayload }) =>
      updateCustomer(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
};
