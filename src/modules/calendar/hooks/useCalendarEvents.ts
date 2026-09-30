import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCalendarEvents,
  type GetCalendarEventsParams,
} from "../actions/get-calendar-events";

export const calendarKeys = {
  all: ["calendar-events"] as const,
  range: (params: GetCalendarEventsParams) =>
    [...calendarKeys.all, params] as const,
};

export const useCalendarEvents = (params: GetCalendarEventsParams) => {
  return useQuery({
    queryKey: calendarKeys.range(params),
    queryFn: () => getCalendarEvents(params),
    enabled: !!params.start_date && !!params.end_date,
    // Keep the previous month's dots while the new month loads.
    placeholderData: keepPreviousData,
  });
};
