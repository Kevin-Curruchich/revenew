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
