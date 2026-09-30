import type { StatusBadgeInfo } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/lib/formatters";
import type {
  Product,
  ProductEarningMode,
  ProductStatus,
  StockAlertStatus,
} from "../domain/product";
import type { StockMovement } from "../domain/stock-movement";

export const productStatusBadge: Record<ProductStatus, StatusBadgeInfo> = {
  active: { label: "Activo", variant: "default" },
  inactive: { label: "Inactivo", variant: "secondary" },
};

export const stockAlertBadge: Record<StockAlertStatus, StatusBadgeInfo> = {
  out_of_stock: { label: "Sin stock", variant: "destructive" },
  low_stock: { label: "Stock bajo", variant: "secondary" },
  in_stock: { label: "Stock disponible", variant: "outline" },
};

/** Falls back to comparing with `min_stock` when the API has no alert. */
export const getStockAlertStatus = (
  product: Pick<Product, "stock" | "min_stock" | "stock_alert_status">,
): StockAlertStatus => {
  if (product.stock_alert_status) return product.stock_alert_status;
  if (product.stock <= 0) return "out_of_stock";
  if (product.stock <= product.min_stock) return "low_stock";
  return "in_stock";
};

export const getEarningLabel = (
  mode: ProductEarningMode,
  percent: number | string,
  feeAmount: number | string,
) => (mode === "percent" ? `${Number(percent)}%` : formatCurrency(feeAmount));

const movementBadges: Record<string, StatusBadgeInfo> = {
  purchase: { label: "Compra", variant: "default" },
  sale: { label: "Venta", variant: "destructive" },
  adjustment: { label: "Ajuste", variant: "secondary" },
  initial_stock: { label: "Stock inicial", variant: "outline" },
};

export const getMovementBadge = (
  type: StockMovement["movement_type"],
): StatusBadgeInfo =>
  movementBadges[type] ?? { label: type, variant: "outline" };
