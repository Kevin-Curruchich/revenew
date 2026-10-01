import { describe, expect, it } from "vitest";

import {
  emptySaleItem,
  toSalePayload,
  type SaleFormValues,
} from "./sale-form-schema";

const values = (overrides: Partial<SaleFormValues> = {}): SaleFormValues => ({
  customerId: "c1",
  saleDate: "2026-09-30",
  items: [{ ...emptySaleItem(), productId: "p1", unitPrice: 37 }],
  paymentStatus: "paid",
  paymentMethod: "efectivo",
  ...overrides,
});

describe("toSalePayload payment fields", () => {
  it("sends a paid sale with its payment method", () => {
    const payload = toSalePayload(values({ paymentMethod: "transferencia" }));
    expect(payload.isPaymentPending).toBe(false);
    expect(payload.medioPago).toBe("transferencia");
  });

  it("sends a pending sale without a payment method", () => {
    const payload = toSalePayload(values({ paymentStatus: "pending" }));
    expect(payload.isPaymentPending).toBe(true);
    expect(payload.medioPago).toBeUndefined();
  });

  it("leaves payment out when editing", () => {
    const payload = toSalePayload(values({ paymentStatus: "pending" }), {
      isEditing: true,
    });
    expect(payload).not.toHaveProperty("isPaymentPending");
    expect(payload).not.toHaveProperty("medioPago");
  });
});
