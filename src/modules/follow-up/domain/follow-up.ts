export type FollowUpStatus = "overdue" | "urgent" | "upcoming" | "normal";

export interface FollowUpItem {
  product_id: string;
  product_name: string;
  avg_interval_days: number | null;
  last_purchase_date: string | null; // YYYY-MM-DD
  last_quantity: number;
  estimated_next_purchase: string | null; // YYYY-MM-DD
  days_until: number | null;
  current_stock: number;
  min_stock: number;
  stock_alert: boolean;
}

export interface FollowUp {
  customer_id: string;
  customer: string;
  email: string | null;
  status: FollowUpStatus;
  items: FollowUpItem[];
}
