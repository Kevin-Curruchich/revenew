/**
 * Contract of the sales agent (`/api/v1/agent`). The source of truth is
 * `docs/agente.md` in the backend repo (ai-sales-assistant).
 */

import type { Comando, Mencion } from "./mentions";

export interface AgentThread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

/** A message as returned by `GET /threads/{id}/state`. */
export type StoredMessage =
  | { rol: "usuario"; texto: string; comando?: Comando; menciones?: Mencion[] }
  | { rol: "asistente"; texto: string }
  | { rol: "herramienta"; nombre: string };

/**
 * The signed approval fingerprint (`{datos, firma}`).
 *
 * It is OPAQUE on purpose: the panel stores the exact value it received and
 * sends it back untouched when approving. Never rebuild, reformat or
 * re-request it — that silently disables the server's inventory check.
 */
export type Huella = unknown;

// --- Sale preview (`confirmar_venta`). Decimals travel as strings. ---

export interface SaleLot {
  purchase_item_id: string;
  purchase_id: string;
  purchase_date: string;
  unit_cost: string;
  quantity_available: string;
  quantity_taken: string;
}

export interface SalePreviewItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  requested_quantity: string;
  lotes: SaleLot[];
  cost_basis_unit: string;
  suggested_unit_price: string;
  final_unit_price: string;
  discount_percent?: string | null;
  discount_amount?: string | null;
  is_price_overridden: boolean;
  is_habitual_price: boolean;
  pricing_exception_reason?: string | null;
  subtotal: string;
  gross_profit_unit: string;
  gross_profit_total: string;
  warnings: string[];
}

export interface SalePreview {
  customer_id: string;
  customer_name: string;
  date: string;
  items: SalePreviewItem[];
  totals: {
    total_revenue: string;
    total_cost: string;
    total_gross_profit: string;
  };
}

// --- Purchase preview (`confirmar_compra`). ---

export interface PurchasePreviewItem {
  producto_id: string;
  producto_nombre: string | null;
  producto_sku: string | null;
  producto_activo: boolean;
  producto_existe: boolean;
  cantidad: string;
  costo_unitario: string;
  subtotal: string;
}

export interface PurchasePreview {
  proveedor: string | null;
  referencia: string | null;
  fecha: string;
  medio_pago: string | null;
  notas: string | null;
  items: PurchasePreviewItem[];
  total: string;
}

// --- Cash movement (`confirmar_movimiento_caja`). ---

export type CashMovementType =
  | "entrada"
  | "salida"
  | "aporte_socio"
  | "retiro_socio"
  | "saldo_inicial";

export type PaymentMethod = "efectivo" | "transferencia";

export interface CashMovementDraft {
  tipo: CashMovementType;
  monto: string;
  fecha: string;
  medio_pago: PaymentMethod | null;
  compra_id: string | null;
  venta_id: string | null;
  nota: string | null;
}

// --- Payment of a credit sale (`confirmar_cobro`). ---

export interface PaymentDraft {
  venta_id: string;
  cliente: string;
  fecha_venta: string;
  total: string;
  fecha_pago: string;
  medio_pago: PaymentMethod;
}

// --- Confirmations: same shape from the SSE event and from `/state`. ---

export interface SaleConfirmation {
  tipo: "confirmar_venta";
  interrupt_id: string;
  preview: SalePreview;
  huella: Huella;
}

export interface PurchaseConfirmation {
  tipo: "confirmar_compra";
  interrupt_id: string;
  preview: PurchasePreview;
  huella: Huella;
}

/** Cash movements are facts, not calculations: they carry NO huella. */
export interface CashMovementConfirmation {
  tipo: "confirmar_movimiento_caja";
  interrupt_id: string;
  movimiento: CashMovementDraft;
}

/** Collecting a credit sale: also a fact, so also NO huella. */
export interface PaymentConfirmation {
  tipo: "confirmar_cobro";
  interrupt_id: string;
  cobro: PaymentDraft;
}

/** A pause from a tool this panel doesn't know yet. It can still be answered. */
export interface UnknownConfirmation {
  tipo?: string;
  interrupt_id: string;
  huella?: Huella;
  [key: string]: unknown;
}

export type Confirmation =
  | SaleConfirmation
  | PurchaseConfirmation
  | CashMovementConfirmation
  | PaymentConfirmation;

export type AnyConfirmation = Confirmation | UnknownConfirmation;

export const KNOWN_CONFIRMATION_TYPES = [
  "confirmar_venta",
  "confirmar_compra",
  "confirmar_movimiento_caja",
  "confirmar_cobro",
] as const;

export const isKnownConfirmation = (
  confirmation: AnyConfirmation,
): confirmation is Confirmation =>
  (KNOWN_CONFIRMATION_TYPES as readonly unknown[]).includes(confirmation.tipo);

export interface ThreadState {
  mensajes: StoredMessage[];
  confirmaciones_pendientes: AnyConfirmation[];
}

// --- Answering a confirmation (`decision` in `POST /stream`). ---

export type Decision =
  | { accion: "aprobar"; huella?: Huella }
  | { accion: "cancelar" }
  | { accion: "corregir"; valores: Record<string, unknown> };

// --- SSE events of `POST /stream`. ---

export type AgentEvent =
  | { event: "token"; data: { texto: string } }
  | { event: "herramienta"; data: { nombre: string; estado: string } }
  | { event: "confirmacion"; data: AnyConfirmation }
  | { event: "fin"; data: { estado: "completo" | "pausado" } }
  | { event: "error"; data: { mensaje: string } };

export type AgentToolName =
  | "buscar_cliente"
  | "consultar_caja"
  | "consultar_seguimiento"
  | "previsualizar_venta"
  | "registrar_venta"
  | "registrar_compra"
  | "registrar_movimiento_caja"
  | "consultar_ventas"
  | "registrar_cobro";
