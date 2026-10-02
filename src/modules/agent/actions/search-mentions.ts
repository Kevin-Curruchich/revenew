import dayjs from "dayjs";
import type { QueryClient } from "@tanstack/react-query";

import { formatCurrency } from "@/lib/formatters";
import { getCustomers } from "@/modules/customers/actions/get-customers";
import { customerKeys } from "@/modules/customers/hooks/query-keys";
import type { Customer } from "@/modules/customers/domain/customer";
import { getProductsForSale } from "@/modules/products/actions/get-products-for-sale";
import { productKeys } from "@/modules/products/hooks/query-keys";
import type { ProductForSale } from "@/modules/products/domain/product";
import { getSales } from "@/modules/sales/actions/get-sales";
import { saleKeys } from "@/modules/sales/hooks/query-keys";
import type { Sale } from "@/modules/sales/domain/sale";
import { formatQuantity } from "../domain/labels";
import type { MentionTipo } from "../domain/mentions";

const LIMIT = 8;
const STALE_TIME = 30_000;

export type MentionFilter =
  | { kind: "any" }
  | { kind: "cliente" }
  | { kind: "producto" }
  /** Pending sales of the customer already mentioned (`null`: none yet). */
  | { kind: "venta"; customerId: string | null };

export interface MentionOption {
  tipo: MentionTipo;
  id: string;
  nombre: string;
  detalle: string | null;
  sinStock: boolean;
}

export const toCustomerOption = (customer: Customer): MentionOption => ({
  tipo: "cliente",
  id: customer.id,
  nombre: customer.name,
  detalle: customer.company,
  sinStock: false,
});

export const toProductOption = (product: ProductForSale): MentionOption => {
  const sinStock = product.stock <= 0;
  const price = product.first_available_lot?.suggested_unit_price;
  return {
    tipo: "producto",
    id: product.id,
    nombre: product.name,
    detalle: sinStock
      ? "Sin stock"
      : `Stock ${formatQuantity(product.stock)} · ${formatCurrency(price)}`,
    sinStock,
  };
};

export const toSaleOption = (sale: Sale): MentionOption => ({
  tipo: "venta",
  id: sale.id,
  nombre: `Venta ${dayjs(sale.date).format("DD/MM")} · ${formatCurrency(sale.total)}`,
  detalle: null,
  sinStock: false,
});

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
