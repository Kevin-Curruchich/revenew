import type { QueryClient } from "@tanstack/react-query";

import { getCustomers } from "@/modules/customers/actions/get-customers";
import { customerKeys } from "@/modules/customers/hooks/query-keys";
import { getProductsForSale } from "@/modules/products/actions/get-products-for-sale";
import { productKeys } from "@/modules/products/hooks/query-keys";
import { getSales } from "@/modules/sales/actions/get-sales";
import { saleKeys } from "@/modules/sales/hooks/query-keys";
import { toCustomerOption, toProductOption, toSaleOption } from "../domain/mention-options";
import type { MentionFilter, MentionOption } from "../domain/mention-options";

export { toCustomerOption, toProductOption, toSaleOption } from "../domain/mention-options";
export type { MentionFilter, MentionOption } from "../domain/mention-options";

const LIMIT = 8;
const STALE_TIME = 30_000;

const searchCustomers = async (queryClient: QueryClient, search: string) => {
  const params = { search, limit: LIMIT };
  const response = await queryClient.fetchQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => getCustomers(params),
    staleTime: STALE_TIME,
  });
  return response.data.map(toCustomerOption);
};

const searchProducts = async (queryClient: QueryClient, search: string) => {
  const params = { search, limit: LIMIT };
  const products = await queryClient.fetchQuery({
    queryKey: productKeys.forSale(params),
    queryFn: () => getProductsForSale(params),
    staleTime: STALE_TIME,
  });
  return products.map(toProductOption);
};

const searchPendingSales = async (queryClient: QueryClient, customerId: string) => {
  const params = { customer_id: customerId, is_payment_pending: "true", limit: LIMIT };
  const response = await queryClient.fetchQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => getSales(params),
    staleTime: STALE_TIME,
  });
  return response.data.map(toSaleOption);
};

export const searchMentions = async (
  queryClient: QueryClient,
  filter: MentionFilter,
  query: string,
): Promise<MentionOption[]> => {
  switch (filter.kind) {
    case "cliente":
      return searchCustomers(queryClient, query);
    case "producto":
      return searchProducts(queryClient, query);
    case "venta":
      return filter.customerId ? searchPendingSales(queryClient, filter.customerId) : [];
    case "any": {
      const [customers, products] = await Promise.all([
        searchCustomers(queryClient, query),
        searchProducts(queryClient, query),
      ]);
      return [...customers, ...products];
    }
  }
};
