const LOCALE = "es-GT";

export const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

/**
 * Formats a monetary amount. Accepts strings because some API fields
 * (e.g. `suggested_price`) are serialized as decimals-as-strings.
 */
export const formatCurrency = (
  value: number | string | null | undefined,
): string => {
  const amount = typeof value === "string" ? Number(value) : value;
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }
  return currencyFormatter.format(amount);
};

const longDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const formatLongDate = (date: Date): string =>
  longDateFormatter.format(date);

/** "1 producto" / "3 productos" */
export const pluralize = (count: number, singular: string, plural?: string) =>
  `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;

/** Short, human friendly version of a UUID for tables. */
export const shortId = (id: string) => `#${id.slice(0, 8)}`;
