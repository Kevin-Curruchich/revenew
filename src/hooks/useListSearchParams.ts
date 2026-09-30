import { useSearchParams } from "react-router";

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
