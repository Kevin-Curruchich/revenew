import { describe, expect, it } from "vitest";

import type { ProductLot } from "./product";
import { summarizeLots } from "./product-lot";

const lot = (remaining: string, cost: string): ProductLot => ({
  purchase_item_id: remaining,
  purchase_id: "p",
  purchase_date: "2026-09-01",
  unit_cost: cost,
  remaining_quantity: remaining,
  suggested_unit_price: "0",
});

describe("summarizeLots", () => {
  it("adds remaining units and their cost, fractional units included", () => {
    expect(summarizeLots([lot("6", "33.33"), lot("0.5", "34.00")])).toEqual({
      units: 6.5,
      cost: 6 * 33.33 + 0.5 * 34,
    });
  });

  it("is zero without lots", () => {
    expect(summarizeLots([])).toEqual({ units: 0, cost: 0 });
  });
});
