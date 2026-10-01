import { describe, expect, it } from "vitest";

import {
  formatMovementDate,
  getCashMovementTypeBadge,
  signedAmount,
} from "./cash";

describe("signedAmount", () => {
  it("keeps inflows positive", () => {
    expect(signedAmount({ amount: "50.00", is_outflow: false })).toBe(50);
  });

  it("turns outflows negative", () => {
    expect(signedAmount({ amount: "30.00", is_outflow: true })).toBe(-30);
  });
});

describe("getCashMovementTypeBadge", () => {
  it("labels known types in Spanish", () => {
    expect(getCashMovementTypeBadge("retiro_socio").label).toBe("Retiro socio");
  });
});

describe("formatMovementDate", () => {
  it("shows the date in Guatemala time, not UTC", () => {
    // 03:00 UTC on Sep 10 is still Sep 9 at 21:00 in Guatemala.
    expect(formatMovementDate("2026-09-10T03:00:00Z")).toMatch(/09/);
    expect(formatMovementDate("2026-09-10T03:00:00Z")).not.toMatch(/10 sept/);
  });
});
