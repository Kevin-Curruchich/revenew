import { useQuery } from "@tanstack/react-query";
import {
  getCalendarEvents,
  type CalendarEventsResponse,
  type GetCalendarEventsParams,
} from "../actions/get-calendar-events";

export const useCalendarEvents = (params: GetCalendarEventsParams) => {
  return useQuery<CalendarEventsResponse>({
    queryKey: ["calendar-events", params.start_date, params.end_date],
    queryFn: () => getCalendarEvents(params),
    enabled: !!params.start_date && !!params.end_date,
  });
};
