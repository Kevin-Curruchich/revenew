import type { JSONContent } from "@tiptap/core";

import type { Comando } from "../../domain/mentions";
import { NODE, SLOT_PLACEHOLDERS, type SlotTipo } from "./schema";

const text = (value: string): JSONContent => ({ type: "text", text: value });
const slot = (tipo: SlotTipo): JSONContent => ({
  type: NODE.slot,
  attrs: { tipo, placeholder: SLOT_PLACEHOLDERS[tipo] },
});

const bodies: Record<Comando, JSONContent[]> = {
  venta: [text("Vendí "), slot("cantidad"), text(" "), slot("producto"), text(" a "), slot("cliente"), text(", "), slot("pagado")],
  compra: [text("Compré "), slot("cantidad"), text(" "), slot("producto"), text(" a "), slot("costo"), text(" c/u")],
  cobro: [slot("cliente"), text(" pagó "), slot("venta"), text(" en "), slot("medio")],
  caja: [slot("tipo_caja"), text(" de "), slot("monto"), text(": "), slot("nota")],
};

/** Command chip + the command's sentence with slots to fill. */
export const buildTemplate = (comando: Comando): JSONContent[] => [
  { type: NODE.commandChip, attrs: { comando } },
  text(" "),
  ...bodies[comando],
];

/** One more `[cantidad] [@producto]` pair for sales and purchases. */
export const itemRow = (): JSONContent[] => [text(", "), slot("cantidad"), text(" "), slot("producto")];
