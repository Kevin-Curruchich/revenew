import { z } from "zod";
import { todayISODate } from "@/lib/dates";
import {
  getSuggestedUnitPrice,
  type ProductForSale,
} from "@/modules/products/domain/product";
import type { SalePayload } from "../actions/create-sale";
import type { Sale } from "../domain/sale";

const saleItemSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  quantity: z
    .number({ error: "Ingresa una cantidad" })
    .positive("La cantidad debe ser mayor a 0"),
  unitPrice: z
    .number({ error: "Ingresa un precio" })
    .min(0, "El precio debe ser mayor o igual a 0")
    .optional(),
  /** Price of the product's next lot; used to detect price exceptions. */
  suggestedUnitPrice: z.number().optional(),
  /** The item was already sold with a custom price (edit mode only). */
  isPriceOverridden: z.boolean(),
  pricingExceptionReason: z.string(),
});

type SaleItemValues = z.infer<typeof saleItemSchema>;

/** The seller changed the suggested price: a reason is mandatory. */
export const isPriceException = (item: Partial<SaleItemValues>) =>
  item.suggestedUnitPrice !== undefined &&
  item.unitPrice !== undefined &&
  item.unitPrice !== item.suggestedUnitPrice;

/**
 * Show the reason input for new exceptions, and also for items that were
 * already overridden but whose suggested price is no longer known (e.g. the
 * product ran out of stock) so their reason isn't silently dropped.
 */
export const shouldShowPriceReason = (item: Partial<SaleItemValues>) =>
  isPriceException(item) ||
  (item.suggestedUnitPrice === undefined && !!item.isPriceOverridden);

export const saleFormSchema = z
  .object({
    customerId: z.string().min(1, "El cliente es requerido"),
    saleDate: z.string().min(1, "La fecha es requerida"),
    items: z.array(saleItemSchema).min(1, "Agrega al menos un producto"),
    // Only sent when creating; an existing sale changes its payment status
    // through PaymentStatusControl.
    paymentStatus: z.enum(["paid", "pending"]),
    paymentMethod: z.enum(["efectivo", "transferencia"]),
  })
  .superRefine((value, ctx) => {
    value.items.forEach((item, index) => {
      if (item.unitPrice === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "unitPrice"],
          message: "Ingresa un precio",
        });
      }

      if (isPriceException(item) && !item.pricingExceptionReason.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "pricingExceptionReason"],
          message: "Ingresa el motivo de la excepción de precio",
        });
      }
    });
  });

export type SaleFormValues = z.infer<typeof saleFormSchema>;
export type SaleFormItem = SaleFormValues["items"][number];

export const emptySaleItem = (): SaleFormItem => ({
  productId: "",
  quantity: 1,
  unitPrice: undefined,
  suggestedUnitPrice: undefined,
  isPriceOverridden: false,
  pricingExceptionReason: "",
});

export const toSaleFormValues = (
  sale: Sale | undefined,
  products: ProductForSale[],
  presetCustomerId: string,
): SaleFormValues => {
  if (!sale) {
    return {
      customerId: presetCustomerId,
      saleDate: todayISODate(),
      items: [emptySaleItem()],
      paymentStatus: "paid",
      paymentMethod: "efectivo",
    };
  }

  return {
    customerId: sale.customer_id,
    saleDate: sale.date,
    items: sale.items.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      // Items sold at the suggested price keep that price as reference, so
      // later price changes of the product don't force a reason on edit.
      suggestedUnitPrice: item.is_price_overridden
        ? getSuggestedUnitPrice(
            products.find((product) => product.id === item.product_id),
          )
        : item.unit_price,
      isPriceOverridden: !!item.is_price_overridden,
      pricingExceptionReason: item.pricing_exception_reason ?? "",
    })),
    paymentStatus: sale.is_payment_pending ? "pending" : "paid",
    paymentMethod: "efectivo",
  };
};

export const toSalePayload = (
  values: SaleFormValues,
  { isEditing = false }: { isEditing?: boolean } = {},
): SalePayload => ({
  ...(isEditing
    ? {}
    : {
        isPaymentPending: values.paymentStatus === "pending",
        // A pending sale has no payment yet, so no payment method either.
        medioPago:
          values.paymentStatus === "paid" ? values.paymentMethod : undefined,
      }),
  customerId: values.customerId,
  date: values.saleDate,
  items: values.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    pricingExceptionReason: shouldShowPriceReason(item)
      ? item.pricingExceptionReason.trim() || undefined
      : undefined,
  })),
});

export const getItemSubtotal = (item: Partial<SaleFormItem>) =>
  (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
