import { useSearchParams } from "react-router";
import {
  startOfMonth,
  toISODate,
  todayISODate,
  type ISODateRange,
} from "@/lib/dates";

export const PAGE_PARAM = "page";

/** Reads a 1-based page number, tolerating missing or garbage values. */
export const parsePage = (value: string | null): number => {
  const page = Math.floor(Number(value));
  return Number.isFinite(page) && page >= 1 ? page : 1;
};

type ParamUpdates = Record<string, string | null | undefined>;

/**
 * URL-backed state for list pages (filters + pagination), so filters survive
 * reloads, can be shared as links and work with the browser back button.
 */
export const useListSearchParams = (limit: number) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePage(searchParams.get(PAGE_PARAM));
  const offset = (page - 1) * limit;

  const getParam = (key: string) => searchParams.get(key) ?? "";

  /** Updates filters. Any filter change goes back to the first page. */
  const setParams = (updates: ParamUpdates) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(updates)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        next.delete(PAGE_PARAM);
        return next;
      },
      { replace: true },
    );
  };

  return { page, offset, limit, getParam, setParams };
};

const ALL_DATES = "all";

/**
 * Date range filter that starts on "this month". Clearing it shows every
 * date, so `range=all` remembers the user cleared it.
 */
export const monthDefaultDateRange = ({
  getParam,
  setParams,
}: Pick<ReturnType<typeof useListSearchParams>, "getParam" | "setParams">) => {
  const start = getParam("start_date");
  const end = getParam("end_date");
  const useDefault = !start && !end && getParam("range") !== ALL_DATES;

  return {
    startDate: useDefault ? toISODate(startOfMonth(new Date())) : start,
    endDate: useDefault ? todayISODate() : end,
    setDateRange: ({ start, end }: ISODateRange) =>
      setParams({
        start_date: start,
        end_date: end,
        range: start || end ? null : ALL_DATES,
      }),
  };
};
