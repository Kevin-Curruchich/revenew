import dayjs from "dayjs";
import type { Customer } from "@/modules/customers/domain/customer";
import type { ProductForSale } from "@/modules/products/domain/product";
import type { Sale } from "@/modules/sales/domain/sale";
import { formatCurrency } from "@/lib/formatters";
import { formatQuantity } from "./labels";
import type { MentionTipo } from "./mentions";

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
