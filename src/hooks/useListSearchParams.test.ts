import { describe, expect, it, vi } from "vitest";
import { startOfMonth, toISODate, todayISODate } from "@/lib/dates";
import { monthDefaultDateRange } from "./useListSearchParams";

const withParams = (params: Record<string, string>) => {
  const setParams = vi.fn();
  const range = monthDefaultDateRange({
    getParam: (key) => params[key] ?? "",
    setParams,
  });
  return { ...range, setParams };
};

describe("monthDefaultDateRange", () => {
  it("starts on this month", () => {
    const { startDate, endDate } = withParams({});
    expect(startDate).toBe(toISODate(startOfMonth(new Date())));
    expect(endDate).toBe(todayISODate());
  });

  it("keeps the dates in the URL", () => {
    const { startDate, endDate } = withParams({ start_date: "2026-01-01" });
    expect(startDate).toBe("2026-01-01");
    expect(endDate).toBe("");
  });

  it("shows every date once cleared", () => {
    const { startDate, endDate } = withParams({ range: "all" });
    expect([startDate, endDate]).toEqual(["", ""]);
  });

  it("marks a cleared range and unmarks a picked one", () => {
    const { setDateRange, setParams } = withParams({});
    setDateRange({ start: "", end: "" });
    expect(setParams).toHaveBeenLastCalledWith({
      start_date: "",
      end_date: "",
      range: "all",
    });
    setDateRange({ start: "2026-10-01", end: "" });
    expect(setParams).toHaveBeenLastCalledWith({
      start_date: "2026-10-01",
      end_date: "",
      range: null,
    });
  });
});
