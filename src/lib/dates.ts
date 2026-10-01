import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const ISO_DATE_FORMAT = "YYYY-MM-DD";

/**
 * Formats a Date as `YYYY-MM-DD` using the *local* timezone.
 *
 * Avoid `date.toISOString().split("T")[0]`: it converts to UTC first, so in
 * Guatemala (UTC-6) it returns tomorrow's date after 6pm.
 */
export const toISODate = (date: Date): string =>
  dayjs(date).format(ISO_DATE_FORMAT);

/** Today's date as `YYYY-MM-DD` in the local timezone. */
export const todayISODate = (): string => toISODate(new Date());

/** Parses a strict `YYYY-MM-DD` string. Returns `null` when invalid. */
export const parseISODate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = dayjs(value, ISO_DATE_FORMAT, true);
  return parsed.isValid() ? parsed.toDate() : null;
};

export const startOfMonth = (date: Date): Date =>
  dayjs(date).startOf("month").toDate();

export const endOfMonth = (date: Date): Date =>
  dayjs(date).endOf("month").toDate();

const monthShortFormatter = new Intl.DateTimeFormat("es-GT", {
  month: "short",
});

/** Month name for calendar dropdowns: "sept". */
export const formatMonthShort = (date: Date): string =>
  monthShortFormatter.format(date);

const shortDateFormatter = new Intl.DateTimeFormat("es-GT", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** `2026-09-30` -> "30 sept 2026". Empty string for missing/invalid input. */
export const formatShortDate = (value: string | null | undefined): string => {
  const date = parseISODate(value);
  return date ? shortDateFormatter.format(date) : "";
};

export interface ISODateRange {
  start: string;
  end: string;
}

/** Quick ranges offered by date range pickers, relative to `today`. */
export const dateRangePresets = (today: Date = new Date()) => {
  const day = dayjs(today);
  const lastMonth = day.subtract(1, "month");
  return [
    { label: "Hoy", start: toISODate(today), end: toISODate(today) },
    {
      label: "Últimos 7 días",
      start: toISODate(day.subtract(6, "day").toDate()),
      end: toISODate(today),
    },
    {
      label: "Este mes",
      start: toISODate(startOfMonth(today)),
      end: toISODate(today),
    },
    {
      label: "Mes pasado",
      start: toISODate(lastMonth.startOf("month").toDate()),
      end: toISODate(lastMonth.endOf("month").toDate()),
    },
  ];
};
