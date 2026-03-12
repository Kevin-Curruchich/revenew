import type { SaleItem } from "@/modules/sales/domain/sale";

export interface LastPurchase {
  id: string;
  date: string;
  created_at: string;
  customer_id: string;
  user_id: string;
  total: number;
  updated_at: string;
  items: SaleItem[];
  date_formatted: string;
}

export interface NextPurchase {
  product_id: string;
  product_name: string;
  product_sku: string;
  estimated_date: string;
  avg_interval_days: number;
  last_purchase_date: string;
  last_quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_at_formatted: string;
  updated_at_formatted: string;
  last_purchases?: LastPurchase[];
  next_purchases?: NextPurchase[];
}
