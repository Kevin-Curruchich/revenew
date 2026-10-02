import type { MentionTipo } from "../../domain/mentions";

/** Names of the custom Tiptap nodes, shared by the editor and the pure helpers. */
export const NODE = {
  mention: "mention",
  commandChip: "commandChip",
  slot: "slot",
} as const;

export type SlotTipo =
  | "cantidad"
  | "producto"
  | "cliente"
  | "venta"
  | "pagado"
  | "medio"
  | "monto"
  | "costo"
  | "tipo_caja"
  | "nota";

export const SLOT_PLACEHOLDERS: Record<SlotTipo, string> = {
  cantidad: "cantidad",
  producto: "@producto",
  cliente: "@cliente",
  venta: "@venta pendiente",
  pagado: "pagado/no pagado",
  medio: "efectivo/transferencia",
  monto: "monto",
  costo: "costo",
  tipo_caja: "entrada/salida/aporte/retiro",
  nota: "nota",
};

/** Slots answered by picking one fixed option. */
export const SLOT_CHOICES: Partial<Record<SlotTipo, string[]>> = {
  pagado: ["pagado", "no pagado"],
  medio: ["efectivo", "transferencia"],
  tipo_caja: ["entrada", "salida", "aporte", "retiro"],
};

/** Slots answered with a mention of this type. */
export const PICKER_SLOTS: Partial<Record<SlotTipo, MentionTipo>> = {
  cliente: "cliente",
  producto: "producto",
  venta: "venta",
};
