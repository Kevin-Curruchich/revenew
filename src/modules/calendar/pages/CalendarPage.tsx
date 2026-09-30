import { useSearchParams } from "react-router";
import { es } from "react-day-picker/locale";

import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { endOfMonth, parseISODate, startOfMonth, toISODate } from "@/lib/dates";
import { formatLongDate } from "@/lib/formatters";
import type { CalendarEvent } from "../actions/get-calendar-events";
import { EventDayButton } from "../components/EventDayButton";
import { useCalendarEvents } from "../hooks/useCalendarEvents";

const eventBadges = {
  overdue: { label: "Atrasado", variant: "destructive" },
  upcoming: { label: "Próximo", variant: "default" },
} as const;

const calendarComponents = { DayButton: EventDayButton };

export const CalendarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // The selected date lives in the URL (?date=YYYY-MM-DD); default to today.
  const selectedDate = parseISODate(searchParams.get("date")) ?? new Date();
  const selectedDateKey = toISODate(selectedDate);

  const { data } = useCalendarEvents({
    start_date: toISODate(startOfMonth(selectedDate)),
    end_date: toISODate(endOfMonth(selectedDate)),
  });

  const eventsByDate = new Map<string, CalendarEvent[]>(
    (data?.dates ?? []).map((entry) => [entry.date, entry.events]),
  );

  const datesWithEvent = (type: CalendarEvent["type"]) =>
    (data?.dates ?? [])
      .filter((entry) => entry.events.some((event) => event.type === type))
      .map((entry) => parseISODate(entry.date))
      .filter((date): date is Date => date !== null);

  const selectedEvents = eventsByDate.get(selectedDateKey) ?? [];

  const goToDate = (date: Date) => {
    setSearchParams({ date: toISODate(date) }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Calendario" description="Próximas compras estimadas" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vista de Calendario</CardTitle>
            <CardDescription>
              Fechas estimadas de próximas compras
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              locale={es}
              selected={selectedDate}
              onSelect={(date) => date && goToDate(date)}
              month={selectedDate}
              onMonthChange={goToDate}
              modifiers={{
                overdue: datesWithEvent("overdue"),
                upcoming: datesWithEvent("upcoming"),
              }}
              components={calendarComponents}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos del Día</CardTitle>
              <CardDescription className="first-letter:uppercase">
                {formatLongDate(selectedDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEvents.length > 0 ? (
                <ul className="space-y-3">
                  {selectedEvents.map((event) => (
                    <li
                      key={`${event.customerId}-${event.productId}`}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{event.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          Compra estimada: {event.productName}
                        </p>
                      </div>
                      <StatusBadge status={eventBadges[event.type]} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay eventos para esta fecha
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leyenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data?.summary ? (
                <div className="space-y-1 pb-2 text-sm text-muted-foreground">
                  <p>Próximos: {data.summary.upcoming}</p>
                  <p>Atrasados: {data.summary.overdue}</p>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">Atrasados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm">Próximos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
