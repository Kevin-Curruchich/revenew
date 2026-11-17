import { describe, expect, it } from "vitest";

import { filterOptions } from "./filter-options";

const options = [
  { value: "1", label: "Charly González" },
  { value: "2", label: "Jaime Gonzalez" },
  { value: "3", label: "Tía Lily" },
];

describe("filterOptions", () => {
  it("ignores case and accents", () => {
    expect(filterOptions(options, "GONZALEZ").map((o) => o.value)).toEqual(["1", "2"]);
    expect(filterOptions(options, "tia").map((o) => o.value)).toEqual(["3"]);
  });

  it("matches every word in any order", () => {
    expect(filterOptions(options, "gonz charly").map((o) => o.value)).toEqual(["1"]);
  });

  it("returns everything for an empty query", () => {
    expect(filterOptions(options, "  ")).toHaveLength(3);
  });
});
