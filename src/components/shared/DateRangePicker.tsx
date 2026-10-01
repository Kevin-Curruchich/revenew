import { useState, useSyncExternalStore } from "react";
import dayjs from "dayjs";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { es } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  dateRangePresets,
  formatMonthShort,
  formatShortDate,
  parseISODate,
  startOfMonth,
  toISODate,
  type ISODateRange,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

const WIDE_QUERY = "(min-width: 640px)";

/** Two months side by side only fit from the `sm` breakpoint up. */
const useIsWide = () =>
  useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(WIDE_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WIDE_QUERY).matches,
  );

interface DateRangePickerProps {
  /** `YYYY-MM-DD` bounds; either may be empty for an open range. */
  start: string;
  end: string;
  onChange: (range: ISODateRange) => void;
  placeholder?: string;
  className?: string;
}

const rangeLabel = (start: string, end: string) => {
  if (start && end) {
    return start === end
      ? formatShortDate(start)
      : `${formatShortDate(start)} – ${formatShortDate(end)}`;
  }
  if (start) return `Desde ${formatShortDate(start)}`;
  if (end) return `Hasta ${formatShortDate(end)}`;
  return "";
};

/**
 * One button for a date range filter: a two-month calendar plus quick
 * presets, instead of two separate native inputs.
 */
export const DateRangePicker = ({
  start,
  end,
  onChange,
  placeholder = "Todas las fechas",
  className,
}: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const isWide = useIsWide();
  // First click of a new range; the second click completes and applies it.
  const [anchor, setAnchor] = useState<Date | null>(null);
  const committed: DateRange | undefined =
    start || end
      ? {
          from: parseISODate(start) ?? undefined,
          to: parseISODate(end) ?? undefined,
        }
      : undefined;
  const selected: DateRange | undefined = anchor
    ? { from: anchor, to: undefined }
    : committed;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setAnchor(null);
  };
  const label = rangeLabel(start, end);

  const apply = (range: ISODateRange) => {
    onChange(range);
    handleOpenChange(false);
  };

  const handleDayClick = (day: Date) => {
    if (!anchor) {
      setAnchor(day);
      return;
    }
    const [from, to] = anchor <= day ? [anchor, day] : [day, anchor];
    apply({ start: toISODate(from), end: toISODate(to) });
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Filtrar por fechas"
          className={cn(
            "w-full justify-start font-normal sm:w-auto sm:min-w-56",
            !label && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          <span className="truncate">{label || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-h-(--radix-popover-content-available-height) w-auto overflow-y-auto p-0"
        align="start"
        collisionPadding={8}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="grid grid-cols-2 gap-1 border-b border-border p-2 sm:flex sm:w-36 sm:flex-col sm:border-r sm:border-b-0">
            {dateRangePresets().map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => apply(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div>
            <Calendar
              mode="range"
              locale={es}
              captionLayout="dropdown"
              formatters={{ formatMonthDropdown: formatMonthShort }}
              numberOfMonths={isWide ? 2 : 1}
              selected={selected}
              // Filters look back: with two months, open on last month +
              // this month; with one, on this month.
              defaultMonth={
                selected?.from ??
                selected?.to ??
                startOfMonth(
                  dayjs()
                    .subtract(isWide ? 1 : 0, "month")
                    .toDate(),
                )
              }
              // Controlled through `selected`; the click itself drives the
              // anchor logic instead of the library's range extension.
              onSelect={(_, day) => handleDayClick(day)}
              startMonth={new Date(2020, 0)}
              endMonth={new Date(new Date().getFullYear() + 1, 11)}
            />
            <div className="flex items-center justify-between gap-2 border-t border-border p-2">
              <span className="px-2 text-xs text-muted-foreground">
                {anchor ? "Elige la fecha final" : "Elige la fecha inicial"}
              </span>
              {start || end ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => apply({ start: "", end: "" })}
                >
                  <X />
                  Limpiar fechas
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
