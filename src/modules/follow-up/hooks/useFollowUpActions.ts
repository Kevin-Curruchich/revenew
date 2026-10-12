import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { calendarKeys } from "@/modules/calendar/hooks/useCalendarEvents";
import { customerKeys } from "@/modules/customers/hooks/query-keys";
import { dashboardKeys } from "@/modules/dashboard/hooks/useDashboardSummary";
import { dismissFollowUp } from "../actions/dismiss-follow-up";
import { postponeFollowUp } from "../actions/postpone-follow-up";
import { followUpKeys } from "./useFollowUps";

/** Follow-ups feed the lists, the dashboard metrics and the calendar. */
const invalidateFollowUpDependents = (queryClient: QueryClient) =>
  Promise.all(
    [
      followUpKeys.all,
      dashboardKeys.all,
      calendarKeys.all,
      customerKeys.all,
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );

/**
 * 409 means the follow-up was already closed (double click, another user, a
 * new sale): not an error, the refetch shows the current list.
 */
const ignoreAlreadyClosed = (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 409) return;
  throw error;
};

export const usePostponeFollowUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ followUpId, date }: { followUpId: string; date: string }) =>
      postponeFollowUp(followUpId, date).then(() => {}, ignoreAlreadyClosed),
    onSuccess: () => invalidateFollowUpDependents(queryClient),
  });
};

export const useDismissFollowUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (followUpId: string) =>
      dismissFollowUp(followUpId).catch(ignoreAlreadyClosed),
    onSuccess: () => invalidateFollowUpDependents(queryClient),
  });
};
