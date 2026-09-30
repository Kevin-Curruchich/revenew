import type {
  AnyConfirmation,
  CashMovementDraft,
  Decision,
  PurchasePreview,
  SalePreview,
} from "./agent";

/**
 * The approval for a confirmation.
 *
 * The huella is sent back EXACTLY as it arrived (same value, untouched).
 * It is the only proof that the figures the person approved are the ones
 * the server showed; rebuilding it or fetching a fresh preview would make
 * the server's comparison always pass and hide real inventory changes.
 *
 * Cash movements carry no huella, and then none is sent.
 */
export const buildApproveDecision = (
  confirmation: AnyConfirmation,
): Decision =>
  "huella" in confirmation && confirmation.huella !== undefined
    ? { accion: "aprobar", huella: confirmation.huella }
    : { accion: "aprobar" };

export const CANCEL_DECISION: Decision = { accion: "cancelar" };

export type CorrectionDecision = Extract<Decision, { accion: "corregir" }>;

/*
 * `corregir` merges `valores` over the ARGUMENTS of the write tool, so its
 * keys are the tool's parameter names — not the preview's field names. For
 * sales and purchases `items` is replaced as a whole, so every item has to
 * be sent, not only the edited one.
 */

export interface SaleItemEdit {
  cantidad: string;
  /** Empty string = keep the price the server would suggest. */
  precio_unitario: string;
}

export const buildSaleCorrection = (
  preview: SalePreview,
  /** One entry per preview item, by index (a product may appear twice). */
  edits: ReadonlyArray<SaleItemEdit | undefined>,
): CorrectionDecision => ({
  accion: "corregir",
  valores: {
    items: preview.items.map((item, index) => {
      const edit = edits[index];
      const cantidad = edit?.cantidad ?? item.requested_quantity;
      const editedPrice = edit?.precio_unitario.trim();
      // Keep a price that was explicitly set (by the person or the agent);
      // otherwise let the server suggest it again for the new quantity.
      const precio = editedPrice
        ? editedPrice
        : item.is_price_overridden
          ? item.final_unit_price
          : undefined;
      return {
        producto_id: item.product_id,
        cantidad,
        ...(precio !== undefined ? { precio_unitario: precio } : {}),
      };
    }),
  },
});

export interface PurchaseItemEdit {
  cantidad: string;
  costo_unitario: string;
}

export const buildPurchaseCorrection = (
  preview: PurchasePreview,
  /** One entry per preview item, by index. */
  edits: ReadonlyArray<PurchaseItemEdit | undefined>,
): CorrectionDecision => ({
  accion: "corregir",
  valores: {
    items: preview.items.map((item, index) => ({
      producto_id: item.producto_id,
      cantidad: edits[index]?.cantidad ?? item.cantidad,
      costo_unitario: edits[index]?.costo_unitario ?? item.costo_unitario,
    })),
  },
});

export type CashMovementEdit = Partial<
  Pick<CashMovementDraft, "monto" | "fecha" | "medio_pago" | "nota">
>;

/** Only the fields that actually changed, as the contract asks. */
export const buildCashMovementCorrection = (
  movement: CashMovementDraft,
  edit: CashMovementEdit,
): CorrectionDecision | null => {
  const valores = Object.fromEntries(
    Object.entries(edit).filter(
      ([key, value]) => value !== movement[key as keyof CashMovementDraft],
    ),
  );
  return Object.keys(valores).length > 0
    ? { accion: "corregir", valores }
    : null;
};
