import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const mockEvents = [
  { date: "2026-01-22", customer: "Juan Pérez", type: "overdue" },
  { date: "2026-01-25", customer: "María García", type: "upcoming" },
  { date: "2026-01-25", customer: "Luis Hernández", type: "upcoming" },
  { date: "2026-01-28", customer: "Carlos López", type: "upcoming" },
  { date: "2026-02-05", customer: "Ana Martínez", type: "upcoming" },
];

export const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getEventsForDate = (selectedDate: Date) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    return mockEvents.filter((event) => event.date === dateStr);
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
              onSelect={setDate}
              className="rounded-md border"
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
                            Compra estimada
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

      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>Lista de próximas compras estimadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockEvents.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{event.customer}</p>
                  <p className="text-sm text-gray-600">{event.date}</p>
                </div>
                <Badge
                  variant={event.type === "overdue" ? "destructive" : "default"}
                >
                  {event.type === "overdue" ? "Atrasado" : "Próximo"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
