export type ProductStatus = "active" | "inactive";
export type StockAlertStatus = "low_stock" | "out_of_stock" | "in_stock";
export type ProductEarningMode = "percent" | "fee";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  earning_mode: ProductEarningMode;
  earning_percent: number;
  earning_fee_amount: number;
  stock: number;
  min_stock: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  created_at_formatted: string;
  updated_at_formatted: string;
  suggested_price: string | null;
  stock_alert_status?: StockAlertStatus;
  should_reorder?: boolean;
}

export interface ProductLot {
  purchase_item_id: string;
  purchase_id: string;
  purchase_date: string;
  unit_cost: string;
  remaining_quantity: number;
  suggested_unit_price: string;
}

/** Product as returned by `/products/for-sale` (with its next FIFO lot). */
export interface ProductForSale {
  id: string;
  sku: string;
  name: string;
  stock: number;
  earning_mode: ProductEarningMode;
  earning_percent: string;
  earning_fee_amount: string;
  status: ProductStatus;
  first_available_lot: ProductLot | null;
  has_more_lots: boolean;
}

/** Suggested unit price of the next lot to be sold, if there is stock. */
export const getSuggestedUnitPrice = (
  product: ProductForSale | undefined,
): number | undefined => {
  const price = product?.first_available_lot?.suggested_unit_price;
  if (price === undefined || price === null) return undefined;
  const parsed = Number(price);
  return Number.isNaN(parsed) ? undefined : parsed;
};
