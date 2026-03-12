import { revenewApi } from "@/api/revenewApi";

export type CalendarEventType = "overdue" | "upcoming";

export interface CalendarEvent {
  date: string;
  customerId: string;
  customer: string;
  productId: string;
  productName: string;
  type: CalendarEventType;
}

export interface CalendarDateEvents {
  date: string;
  events: CalendarEvent[];
}

export interface CalendarEventsSummary {
  upcoming: number;
  overdue: number;
}

export interface CalendarEventsResponse {
  dates: CalendarDateEvents[];
  summary: CalendarEventsSummary;
}

export interface GetCalendarEventsParams {
  start_date: string;
  end_date: string;
}

export const getCalendarEvents = async (
  params: GetCalendarEventsParams,
): Promise<CalendarEventsResponse> => {
  const response = await revenewApi.get<CalendarEventsResponse>(
    "/calendar/events",
    {
      params,
    },
  );

  return response.data;
};
