export type StockMovementType =
  | "purchase"
  | "sale"
  | "adjustment"
  | "initial_stock";

export interface StockMovement {
  id: string;
  product_id: string;
  // The API may add new movement types; keep unknown values displayable.
  movement_type: StockMovementType | (string & {});
  quantity_change: number;
  stock_before?: number;
  stock_after?: number;
  reference_type?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  created_at?: string;
  created_at_formatted?: string;
}
