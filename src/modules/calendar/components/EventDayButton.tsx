import type { ComponentProps } from "react";
import type { DayButton } from "react-day-picker";
import { CalendarDayButton } from "@/components/ui/calendar";

/**
 * Day cell with colored dots for the `overdue` / `upcoming` modifiers passed
 * to <Calendar />. Defined at module level so react-day-picker doesn't
 * remount every day on each render.
 */
export const EventDayButton = (props: ComponentProps<typeof DayButton>) => {
  const { modifiers } = props;
  const hasOverdue = !!modifiers.overdue;
  const hasUpcoming = !!modifiers.upcoming;

  return (
    <div className="relative h-full w-full p-4">
      <CalendarDayButton {...props} />
      {hasOverdue || hasUpcoming ? (
        <div className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
          {hasOverdue ? (
            <span className="h-3 w-3 rounded-full bg-red-500" />
          ) : null}
          {hasUpcoming ? (
            <span className="h-3 w-3 rounded-full bg-blue-500" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
