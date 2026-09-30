import { z } from "zod";
import { todayISODate } from "@/lib/dates";
import type { PurchasePayload } from "../actions/create-purchase";
import type { Purchase } from "../domain/purchase";

export const purchaseFormSchema = z.object({
  supplierName: z.string().trim().min(1, "El proveedor es requerido"),
  purchaseDate: z.string().min(1, "La fecha es requerida"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "El producto es requerido"),
        quantity: z
          .number({ error: "Ingresa una cantidad" })
          .int("Debe ser un número entero")
          .min(1, "La cantidad debe ser mayor a 0"),
        unitCost: z
          .number({ error: "Ingresa un costo" })
          .min(0, "El costo debe ser mayor o igual a 0"),
      }),
    )
    .min(1, "Agrega al menos un producto"),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;
export type PurchaseFormItem = PurchaseFormValues["items"][number];

export const emptyPurchaseItem = (productId = ""): PurchaseFormItem => ({
  productId,
  quantity: 1,
  unitCost: 0,
});

export const toPurchaseFormValues = (
  purchase: Purchase | undefined,
  presetProductId: string,
): PurchaseFormValues =>
  purchase
    ? {
        supplierName: purchase.supplier_name,
        purchaseDate: purchase.date,
        items: purchase.items.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitCost: item.unit_cost,
        })),
      }
    : {
        supplierName: "",
        purchaseDate: todayISODate(),
        items: [emptyPurchaseItem(presetProductId)],
      };

export const toPurchasePayload = (
  values: PurchaseFormValues,
): PurchasePayload => ({
  supplierName: values.supplierName,
  date: values.purchaseDate,
  items: values.items,
});

export const getItemSubtotal = (item: Partial<PurchaseFormItem>) =>
  (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);
