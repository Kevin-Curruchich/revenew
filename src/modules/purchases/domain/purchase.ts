export type PurchaseStatus = "draft" | "confirmed" | "cancelled";

export interface PurchaseItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  product_name: string;
  product_sku: string;
  product_status?: string;
  product_earning_mode?: "percent" | "fee" | string;
  product_earning_percent?: number;
  product_earning_fee_amount?: number;
}

export interface Purchase {
  id: string;
  supplier_name: string;
  date: string;
  total: number;
  status: PurchaseStatus | string;
  items: PurchaseItem[];
  created_at: string;
  updated_at: string;
  created_at_formatted?: string;
  updated_at_formatted?: string;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  notes?: string | null;
}
