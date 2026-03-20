// Sale domain interfaces updated to match API contract

export interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name: string;
  product_sku: string;
  product_status: string;
  cost_basis_unit?: number;
  gross_profit_unit?: number;
  gross_profit_total?: number;
  is_price_overridden?: boolean;
  pricing_exception_reason?: string | null;
  product_earning_mode?: "percent" | "fee" | string;
  product_earning_percent?: number;
  product_earning_fee_amount?: number;
}

export interface Sale {
  id: string;
  customer_id: string;
  user_id: string;
  date: string;
  total: number;
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
