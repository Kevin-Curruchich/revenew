import { describe, expect, it } from "vitest";

import { dateRangePresets, formatShortDate } from "./dates";

describe("formatShortDate", () => {
  it("formats an ISO date in Spanish without shifting the day", () => {
    expect(formatShortDate("2026-09-30")).toMatch(/^30 sept?\.? 2026$/);
  });

  it("returns an empty string for missing or invalid values", () => {
    expect(formatShortDate("")).toBe("");
    expect(formatShortDate("2026-13-40")).toBe("");
  });
});

describe("dateRangePresets", () => {
  const today = new Date(2026, 9, 1); // Oct 1, 2026 (local time)
  const byLabel = Object.fromEntries(
    dateRangePresets(today).map(({ label, start, end }) => [
      label,
      { start, end },
    ]),
  );

  it("covers today, the last 7 days and this month up to today", () => {
    expect(byLabel["Hoy"]).toEqual({ start: "2026-10-01", end: "2026-10-01" });
    expect(byLabel["Últimos 7 días"]).toEqual({
      start: "2026-09-25",
      end: "2026-10-01",
    });
    expect(byLabel["Este mes"]).toEqual({
      start: "2026-10-01",
      end: "2026-10-01",
    });
  });

  it("covers the whole previous month", () => {
    expect(byLabel["Mes pasado"]).toEqual({
      start: "2026-09-01",
      end: "2026-09-30",
    });
  });
});
