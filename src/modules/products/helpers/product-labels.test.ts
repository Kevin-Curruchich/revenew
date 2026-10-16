import { describe, expect, it } from "vitest";
import { getStockAlertStatus } from "./product-labels";

describe("getStockAlertStatus", () => {
  it("compares decimal strings as numbers", () => {
    // As text, "10.00" <= "6.00" is true and would flag low stock.
    expect(getStockAlertStatus({ stock: "10.00", min_stock: 6 })).toBe(
      "in_stock",
    );
    expect(getStockAlertStatus({ stock: "6.00", min_stock: 6 })).toBe(
      "low_stock",
    );
    expect(getStockAlertStatus({ stock: "0.00", min_stock: 6 })).toBe(
      "out_of_stock",
    );
  });
});
