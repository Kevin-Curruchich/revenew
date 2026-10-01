import type { ProfitReportGroupBy } from "../actions/get-profit-report";

/** Gross margin as a percentage of revenue; `null` when there was no revenue. */
export const grossMarginPercent = (
  revenue: number | string,
  grossProfit: number | string,
): number | null => {
  const income = Number(revenue);
  if (!income) return null;
  return (Number(grossProfit) / income) * 100;
};

export const formatPercent = (value: number | null): string =>
  value === null ? "—" : `${value.toFixed(1)}%`;

/** Where each report row leads: the sale, the product, or the customer's sales. */
export const profitRowLink = (
  groupBy: ProfitReportGroupBy,
  key: string,
): string => {
  switch (groupBy) {
    case "sale":
      return `/sales/${key}`;
    case "product":
      return `/products/${key}`;
    case "customer":
      return `/sales?customer_id=${key}`;
  }
};
