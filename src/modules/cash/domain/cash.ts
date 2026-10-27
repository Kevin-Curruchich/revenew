import type { StatusBadgeInfo } from "@/components/shared/StatusBadge";

export type CashMovementType =
  "entrada" | "salida" | "aporte_socio" | "retiro_socio" | "saldo_inicial";

export interface CashMovement {
  id: string;
  occurred_at: string;
  type: CashMovementType;
  /** Always positive; `is_outflow` tells whether it subtracts. */
  amount: string;
  is_outflow: boolean;
  payment_method: "efectivo" | "transferencia" | null;
  sale_id: string | null;
  purchase_id: string | null;
  note: string | null;
  /** Cash balance right after this movement. */
  running_balance: string;
  created_at: string;
}

export interface CashSummary {
  balance: string;
  owner_balance: string;
}

/**
 * Cash + inventory + receivables, minus what the business owes the partner
 * (`owner_balance`).
 */
export const netCapital = (
  summary: CashSummary,
  totals: { inventory_value: string; receivable: string },
): number =>
  Number(summary.balance) +
  Number(totals.inventory_value) +
  Number(totals.receivable) -
  Number(summary.owner_balance);

export const cashMovementTypeBadges: Record<CashMovementType, StatusBadgeInfo> =
  {
    entrada: { label: "Entrada", variant: "default" },
    salida: { label: "Salida", variant: "destructive" },
    aporte_socio: { label: "Aporte socio", variant: "secondary" },
    retiro_socio: { label: "Retiro socio", variant: "outline" },
    saldo_inicial: { label: "Saldo inicial", variant: "secondary" },
  };

export const getCashMovementTypeBadge = (
  type: CashMovementType,
): StatusBadgeInfo =>
  cashMovementTypeBadges[type] ?? { label: type, variant: "outline" };

/** Amount with its sign: outflows are negative. */
export const signedAmount = (
  movement: Pick<CashMovement, "amount" | "is_outflow">,
): number => {
  const amount = Number(movement.amount);
  return movement.is_outflow ? -amount : amount;
};

// The ledger lives in the business timezone; show it there regardless of
// where the browser is.
const movementDateFormatter = new Intl.DateTimeFormat("es-GT", {
  timeZone: "America/Guatemala",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "09/09/2026 21:00" */
export const formatMovementDate = (value: string): string =>
  movementDateFormatter.format(new Date(value)).replace(", ", " ");
