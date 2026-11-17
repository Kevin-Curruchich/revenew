import { z } from "zod";

import type { CashMovementPayload } from "../actions/create-cash-movement";

const NO_PAYMENT_METHOD = "none";

export const cashMovementFormSchema = z.object({
  type: z.enum(["entrada", "salida", "aporte_socio", "retiro_socio", "saldo_inicial"]),
  amount: z
    .string()
    .trim()
    .min(1, "Requerido")
    .refine((value) => Number(value) > 0, "El monto debe ser mayor a 0"),
  date: z.string().min(1, "Requerido"),
  payment_method: z.enum(["efectivo", "transferencia", NO_PAYMENT_METHOD]),
  note: z.string().trim(),
});

export type CashMovementFormValues = z.infer<typeof cashMovementFormSchema>;

export const toCashMovementPayload = (
  values: CashMovementFormValues,
): CashMovementPayload => ({
  type: values.type,
  amount: values.amount,
  date: values.date,
  payment_method:
    values.payment_method === NO_PAYMENT_METHOD ? null : values.payment_method,
  note: values.note || null,
});
