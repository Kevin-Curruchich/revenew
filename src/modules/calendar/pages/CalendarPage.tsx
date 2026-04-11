import type React from "react";
import { useSearchParams } from "react-router";
import type { DayButton } from "react-day-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import {
  formatDateToYMD,
  getMonthEnd,
  getMonthStart,
  parseDateString,
} from "../helpers/date-helpers";

interface CalendarDayButtonProps extends React.ComponentProps<
  typeof DayButton
> {
  getEventsForDate?: (date: Date) => Array<{ type: "overdue" | "upcoming" }>;
}

const CustomCalendarDayButton = ({
  getEventsForDate,
  day,
  ...props
}: CalendarDayButtonProps) => {
  const events = getEventsForDate ? getEventsForDate(day.date) : [];
  const hasOverdue = events.some((e) => e.type === "overdue");
  const hasUpcoming = events.some((e) => e.type === "upcoming");

  return (
    <div className="relative w-full h-full p-4">
      <CalendarDayButton day={day} {...props} />
      {(hasOverdue || hasUpcoming) && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
          {hasOverdue && (
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          )}
          {hasUpcoming && (
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          )}
        </div>
      )}
    </div>
  );
};

export const CalendarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get date from query params, default to current date
  const dateParam = searchParams.get("date");
  const date = dateParam ? parseDateString(dateParam) : new Date();

  const monthStart = getMonthStart(date);
  const monthEnd = getMonthEnd(date);

  const { data: calendarData } = useCalendarEvents({
    start_date: formatDateToYMD(monthStart),
    end_date: formatDateToYMD(monthEnd),
  });

  const dates = calendarData?.dates ?? [];
  const summary = calendarData?.summary;

  const getEventsForDate = (selectedDate: Date) => {
    const dateStr = formatDateToYMD(selectedDate);
    const dayData = dates.find((entry) => entry.date === dateStr);
    return dayData?.events ?? [];
  };

  const selectedEvents = date ? getEventsForDate(date) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendario</h1>
        <p className="text-gray-600">Próximas compras estimadas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setSearchParams({
                    date: formatDateToYMD(newDate),
                  });
                }
              }}
              month={date}
              onMonthChange={(newMonth) => {
                // When month changes, update to the first day of that month
                setSearchParams({
                  date: formatDateToYMD(newMonth),
                });
              }}
              className="rounded-md border"
              components={{
                DayButton: (props) => (
                  <CustomCalendarDayButton
                    {...props}
                    getEventsForDate={getEventsForDate}
                  />
                ),
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos del Día</CardTitle>
              <CardDescription>
                {date
                  ? date.toLocaleDateString("es-MX", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Selecciona una fecha"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map((event, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{event.customer}</p>
                          <p className="text-sm text-gray-600">
                            Compra estimada:
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.productName}
                          </p>
                        </div>
                        <Badge
                          variant={
                            event.type === "overdue" ? "destructive" : "default"
                          }
                        >
                          {event.type === "overdue" ? "Atrasado" : "Próximo"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
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
              {summary && (
                <div className="pb-2 text-sm text-gray-600 space-y-1">
                  <p>Próximos: {summary.upcoming}</p>
                  <p>Atrasados: {summary.overdue}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Atrasados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Próximos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-sm">Sin eventos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
