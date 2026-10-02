import { z } from "zod";

const positiveDecimal = (message: string) =>
  z
    .string()
    .trim()
    .min(1, "Requerido")
    .refine((value) => Number(value) > 0, message);

const nonNegativeDecimal = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "Debe ser un número mayor o igual a 0",
  );

export const saleEditSchema = z.object({
  items: z.array(
    z.object({
      cantidad: positiveDecimal("La cantidad debe ser mayor a 0"),
      precio_unitario: nonNegativeDecimal,
    }),
  ),
});

export const purchaseEditSchema = z.object({
  items: z.array(
    z.object({
      cantidad: positiveDecimal("La cantidad debe ser mayor a 0"),
      costo_unitario: positiveDecimal("El costo debe ser mayor a 0"),
    }),
  ),
});

export const cashMovementEditSchema = z.object({
  monto: positiveDecimal("El monto debe ser mayor a 0"),
  fecha: z.string().min(1, "Requerido"),
  medio_pago: z.enum(["efectivo", "transferencia", "none"]),
  nota: z.string(),
});

export const paymentEditSchema = z.object({
  fecha_pago: z.string().min(1, "Requerido"),
  medio_pago: z.enum(["efectivo", "transferencia"]),
});

export type SaleEditValues = z.infer<typeof saleEditSchema>;
export type PurchaseEditValues = z.infer<typeof purchaseEditSchema>;
export type CashMovementEditValues = z.infer<typeof cashMovementEditSchema>;
export type PaymentEditValues = z.infer<typeof paymentEditSchema>;
