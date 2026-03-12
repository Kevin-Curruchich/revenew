import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/**
 * Parses a date string with a specified format
 * @param dateString - The date string to parse
 * @param format - The format of the date string (default: "YYYY-MM-DD")
 * @returns A Date object or null if invalid
 */
export const parseDateString = (
  dateString: string,
  format: string = "YYYY-MM-DD",
): Date => {
  const parsed = dayjs(dateString, format, true);
  if (!parsed.isValid()) return new Date();
  return parsed.toDate();
};

/**
 * Formats a Date object to YYYY-MM-DD string
 * @param date - The date to format
 * @returns A formatted date string
 */
export const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Return a new dayjs instance, by default or the provided date string in YYYY-MM-DD format
 * @param dateString - Optional date string to parse
 * @returns A Date object
 */
export const getToday = (dateString?: string): Date => {
  if (dateString) {
    const parsed = parseDateString(dateString);
    if (parsed) return parsed;
  }
  return new Date();
};

/**
 * Dayjs method to get the start of the month for a given date
 * @param date - The date to get the month start for
 * @returns A Date object representing the start of the month
 */
export const getMonthStart = (date: Date): Date => {
  return dayjs(date).startOf("month").toDate();
};

/**
 * Dayjs method to get the end of the month for a given date
 * @param date - The date to get the month end for
 * @returns A Date object representing the end of the month
 */
export const getMonthEnd = (date: Date): Date => {
  return dayjs(date).endOf("month").toDate();
};

/**
 * Get menth number from a date * @param date - The date to get the month number from
 * @returns The month number (0-11)
 */
export const getMonthNumber = (date: Date): number => {
  return date.getMonth();
};
