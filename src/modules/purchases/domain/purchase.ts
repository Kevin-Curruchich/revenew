import type { Decimal } from "@/lib/api-types";
import type { StatusBadgeInfo } from "@/components/shared/StatusBadge";

export type PurchaseStatus = "draft" | "confirmed" | "cancelled";

export interface PurchaseItem {
  id: string;
  product_id: string;
  quantity: Decimal;
  unit_cost: Decimal;
  subtotal: Decimal;
  product_name: string;
  product_sku: string;
  product_status?: string;
  product_earning_mode?: "percent" | "fee";
  product_earning_percent?: Decimal;
  product_earning_fee_amount?: Decimal;
}

export interface Purchase {
  id: string;
  supplier_name: string;
  date: string;
  total: Decimal;
  status: PurchaseStatus;
  items: PurchaseItem[];
  created_at: string;
  updated_at: string;
  created_at_formatted?: string;
  updated_at_formatted?: string;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  notes?: string | null;
}

export const purchaseStatusBadges: Record<PurchaseStatus, StatusBadgeInfo> = {
  draft: { label: "Borrador", variant: "secondary" },
  confirmed: { label: "Confirmada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

export const getPurchaseStatusBadge = (status: PurchaseStatus) =>
  purchaseStatusBadges[status] ?? purchaseStatusBadges.draft;

/** Only drafts can be edited, confirmed, cancelled or deleted. */
export const isPurchaseEditable = (purchase: Pick<Purchase, "status">) =>
  purchase.status === "draft";
