import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomer } from "../actions/get-customer";
import {
  createCustomer,
  type CreateCustomerData,
} from "../actions/create-customer";
import {
  updateCustomer,
  type UpdateCustomerData,
} from "../actions/update-customer";
import type { Customer } from "../domain/customer";

export const useCustomer = (id?: string) => {
  const queryClient = useQueryClient();

  // Query
  const query = useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: () => getCustomer(id!),
    enabled: !!id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerData) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: UpdateCustomerData;
    }) => updateCustomer(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer", variables.customerId],
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  return {
    // Query data
    customer: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    // Mutations
    createCustomer: createMutation.mutateAsync,
    updateCustomer: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
