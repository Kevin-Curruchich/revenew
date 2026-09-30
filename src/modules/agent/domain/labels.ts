import type { CashMovementType, PaymentMethod } from "./agent";

const toolLabels: Record<string, { running: string; done: string }> = {
  buscar_cliente: { running: "Buscando cliente…", done: "Buscó el cliente" },
  consultar_caja: { running: "Consultando la caja…", done: "Consultó la caja" },
  consultar_seguimiento: {
    running: "Consultando seguimiento…",
    done: "Consultó el seguimiento",
  },
  previsualizar_venta: {
    running: "Calculando la venta y los lotes…",
    done: "Calculó la venta",
  },
  registrar_venta: {
    running: "Preparando la venta…",
    done: "Preparó la venta",
  },
  registrar_compra: {
    running: "Preparando la compra…",
    done: "Preparó la compra",
  },
  registrar_movimiento_caja: {
    running: "Preparando el movimiento de caja…",
    done: "Preparó un movimiento de caja",
  },
};

export const getToolLabel = (name: string, state: "running" | "done") =>
  toolLabels[name]?.[state] ??
  (state === "running" ? `Usando ${name}…` : `Usó ${name}`);

export const cashMovementTypeLabels: Record<CashMovementType, string> = {
  entrada: "Entrada",
  salida: "Salida",
  aporte_socio: "Aporte del socio",
  retiro_socio: "Retiro del socio",
  saldo_inicial: "Saldo inicial",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
};

export const confirmationTitles: Record<string, string> = {
  confirmar_venta: "Confirmar venta",
  confirmar_compra: "Confirmar compra",
  confirmar_movimiento_caja: "Confirmar movimiento de caja",
};

/** "2", "2.5" or "2.000" -> "2" / "2.5" with local separators. */
export const formatQuantity = (value: string | number) => {
  const amount = Number(value);
  return Number.isNaN(amount)
    ? String(value)
    : amount.toLocaleString("es-GT", { maximumFractionDigits: 3 });
};
