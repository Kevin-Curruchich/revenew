import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { es } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatMonthShort,
  formatShortDate,
  parseISODate,
  toISODate,
  todayISODate,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  /** `YYYY-MM-DD`, or empty for no date. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shows a clear button; leave off for required fields. */
  clearable?: boolean;
  min?: string;
  max?: string;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** Spanish calendar in a popover; replaces the browser's native date input. */
export const DatePicker = ({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  clearable = false,
  min,
  max,
  id,
  disabled,
  className,
  ...aria
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value) ?? undefined;
  const minDate = parseISODate(min);
  const maxDate = parseISODate(max);
  const today = todayISODate();
  const todayAllowed = (!min || today >= min) && (!max || today <= max);

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={aria["aria-invalid"]}
          aria-label={aria["aria-label"]}
          className={cn(
            "w-full justify-start font-normal sm:w-48",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          <span className="truncate">
            {formatShortDate(value) || placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          captionLayout="dropdown"
          formatters={{ formatMonthDropdown: formatMonthShort }}
          selected={selected}
          defaultMonth={selected ?? maxDate ?? undefined}
          onSelect={(date) => date && select(toISODate(date))}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          startMonth={new Date(2020, 0)}
          endMonth={new Date(new Date().getFullYear() + 1, 11)}
        />
        <div className="flex justify-between gap-2 border-t border-border p-2">
          {clearable && value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => select("")}
            >
              <X />
              Limpiar
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!todayAllowed}
            onClick={() => select(today)}
          >
            Hoy
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
