export type ProductStatus = "active" | "inactive";
export type StockAlertStatus = "low_stock" | "out_of_stock" | "in_stock";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
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
