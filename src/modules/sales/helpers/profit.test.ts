import { describe, expect, it } from "vitest";

import { formatPercent, grossMarginPercent, profitRowLink } from "./profit";

describe("grossMarginPercent", () => {
  it("divides profit by revenue, decimals as strings included", () => {
    expect(grossMarginPercent("200.00", "50.00")).toBe(25);
  });

  it("is null without revenue instead of dividing by zero", () => {
    expect(grossMarginPercent("0", "0")).toBeNull();
    expect(formatPercent(null)).toBe("—");
  });
});

describe("profitRowLink", () => {
  it("links each grouping to its detail", () => {
    expect(profitRowLink("sale", "s1")).toBe("/sales/s1");
    expect(profitRowLink("product", "p1")).toBe("/products/p1");
    expect(profitRowLink("customer", "c1")).toBe("/sales?customer_id=c1");
  });
});
