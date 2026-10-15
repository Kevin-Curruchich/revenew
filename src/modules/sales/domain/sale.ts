import type { Decimal } from "@/lib/api-types";
import type { StatusBadgeInfo } from "@/components/shared/StatusBadge";
import type { ProductEarningMode } from "@/modules/products/domain/product";

/** Part of a sale item taken from one purchase lot (FIFO can split an item). */
export interface SaleItemAllocation {
  id: string;
  purchase_item_id: string;
  purchase_id: string;
  quantity_allocated: Decimal;
  unit_cost_snapshot: Decimal;
  lot_purchase_date: string;
}

export interface SaleItem {
  id: string;
  product_id: string;
  quantity: Decimal;
  unit_price: Decimal;
  subtotal: Decimal;
  product_name: string;
  product_sku: string;
  product_status: string;
  cost_basis_unit?: Decimal;
  gross_profit_unit?: Decimal;
  gross_profit_total?: Decimal;
  is_price_overridden?: boolean;
  pricing_exception_reason?: string | null;
  product_earning_mode?: ProductEarningMode;
  product_earning_percent?: Decimal;
  product_earning_fee_amount?: Decimal;
  allocations?: SaleItemAllocation[];
}

export interface Sale {
  id: string;
  customer_id: string;
  user_id: string;
  date: string;
  total: Decimal;
  is_payment_pending: boolean;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
  created_at_formatted: string;
  updated_at_formatted: string;
  user_name: string;
  user_email: string;
  customer_name: string;
  customer_company: string | null;
  customer_email: string | null;
}

export const getPaymentStatusBadge = (
  isPaymentPending: boolean,
): StatusBadgeInfo =>
  isPaymentPending
    ? { label: "Pendiente", variant: "secondary" }
    : { label: "Pagado", variant: "default" };
