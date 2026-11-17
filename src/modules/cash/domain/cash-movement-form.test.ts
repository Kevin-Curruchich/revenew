import { describe, expect, it } from "vitest";

import { cashMovementFormSchema, toCashMovementPayload } from "./cash-movement-form";

const valid = {
  type: "salida",
  amount: "150.50",
  date: "2026-11-06",
  payment_method: "none",
  note: "  ",
} as const;

describe("cashMovementFormSchema", () => {
  it("rejects a zero amount", () => {
    expect(cashMovementFormSchema.safeParse({ ...valid, amount: "0" }).success).toBe(false);
  });

  it("sends no payment method and an empty note as null", () => {
    const values = cashMovementFormSchema.parse(valid);
    expect(toCashMovementPayload(values)).toEqual({
      type: "salida",
      amount: "150.50",
      date: "2026-11-06",
      payment_method: null,
      note: null,
    });
  });
});
