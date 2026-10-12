export type FollowUpStatus =
  | "overdue"
  | "urgent"
  | "upcoming"
  | "normal"
  | "needs_estimate";

export interface FollowUpItem {
  /** Open follow-up record; `null` only when the status is `needs_estimate`. */
  follow_up_id: string | null;
  /** YYYY-MM-DD. Shown as "Próxima compra"; differs from the estimate after a postpone. */
  due_date: string | null;
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

/** The follow-up opened by a postpone (it gets a new id). */
export interface FollowUpRecord {
  id: string;
  customer_id: string;
  product_id: string;
  due_date: string; // YYYY-MM-DD
  status: "open" | "closed";
}
