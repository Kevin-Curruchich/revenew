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
  stock_alert_status?: StockAlertStatus;
  should_reorder?: boolean;
}
