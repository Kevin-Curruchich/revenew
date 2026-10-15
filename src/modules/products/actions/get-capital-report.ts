import { revenewApi } from "@/api/revenewApi";

// Decimals arrive as strings from the API.
export interface CapitalReportRow {
  product_id: string;
  product_name: string;
  product_sku: string;
  stock: string;
  /** Cost of what's left in confirmed lots. */
  inventory_value: string;
  /** Item subtotals on sales still pending payment. */
  receivable: string;
}

export interface CapitalReport {
  /** Biggest first; only products with inventory or receivables. */
  data: CapitalReportRow[];
  totals: { inventory_value: string; receivable: string };
}

/** Snapshot as of now: where the business's money is, by product. */
export const getCapitalReport = async (): Promise<CapitalReport> => {
  const response = await revenewApi.get<CapitalReport>(
    "/products/reports/capital",
  );
  return response.data;
};
