export type StockMovementType =
  | "purchase"
  | "sale"
  | "adjustment"
  | "initial_stock"
  | string;

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: StockMovementType;
  quantity_change: number;
  stock_before?: number;
  stock_after?: number;
  reference_type?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  created_at?: string;
  created_at_formatted?: string;
}
