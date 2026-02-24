import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import type { FollowUp, FollowUpStatus } from "../domain/follow-up";

const mockFollowUps: FollowUp[] = [
  {
    id: 1,
    customer: "Juan Pérez",
    email: "juan@email.com",
    lastPurchase: "2025-12-15",
    nextPurchase: "2026-01-20",
    daysUntil: -1,
    status: "overdue",
  },
  {
    id: 2,
    customer: "María García",
    email: "maria@email.com",
    lastPurchase: "2026-01-05",
    nextPurchase: "2026-01-25",
    daysUntil: 4,
    status: "urgent",
  },
  {
    id: 3,
    customer: "Carlos López",
    email: "carlos@email.com",
    lastPurchase: "2025-11-20",
    nextPurchase: "2026-01-28",
    daysUntil: 7,
    status: "upcoming",
  },
  {
    id: 4,
    customer: "Ana Martínez",
    email: "ana@email.com",
    lastPurchase: "2026-01-10",
    nextPurchase: "2026-02-05",
    daysUntil: 15,
    status: "normal",
  },
  {
    id: 5,
    customer: "Luis Hernández",
    email: "luis@email.com",
    lastPurchase: "2025-10-15",
    nextPurchase: "2026-01-22",
    daysUntil: 1,
    status: "urgent",
  },
];

export const FollowUpListPage = () => {
  const getStatusBadge = (status: FollowUpStatus) => {
    const variants = {
      overdue: { variant: "destructive" as const, label: "Atrasado" },
      urgent: { variant: "default" as const, label: "Urgente" },
      upcoming: { variant: "secondary" as const, label: "Próximo" },
      normal: { variant: "outline" as const, label: "Normal" },
    };

    return variants[status as keyof typeof variants] || variants.normal;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Seguimiento</h1>
          <p className="text-gray-600">Clientes que requieren atención</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4">
        <Button variant="outline" className="flex-1 sm:flex-none">
          Todos
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none">
          Atrasados
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none">
          7 días
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none">
          14 días
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none">
          30 días
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Atrasados</CardDescription>
            <CardTitle className="text-3xl text-red-600">5</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Próximos 7 días</CardDescription>
            <CardTitle className="text-3xl text-orange-600">8</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Próximos 14 días</CardDescription>
            <CardTitle className="text-3xl text-blue-600">12</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Próximos 30 días</CardDescription>
            <CardTitle className="text-3xl">23</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Seguimiento</CardTitle>
          <CardDescription>
            Ordenados por fecha de próxima compra estimada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Próxima Compra Estimada</TableHead>
                <TableHead>Días Restantes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFollowUps.map((followUp) => {
                const statusInfo = getStatusBadge(followUp.status);
                return (
                  <TableRow key={followUp.id}>
                    <TableCell className="font-medium">
                      {followUp.customer}
                    </TableCell>
                    <TableCell>{followUp.email}</TableCell>
                    <TableCell>{followUp.lastPurchase}</TableCell>
                    <TableCell>{followUp.nextPurchase}</TableCell>
                    <TableCell>
                      <span
                        className={
                          followUp.daysUntil < 0
                            ? "text-red-600 font-semibold"
                            : ""
                        }
                      >
                        {followUp.daysUntil < 0
                          ? `${Math.abs(followUp.daysUntil)} días atrasado`
                          : `${followUp.daysUntil} días`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link to={`/customers/${followUp.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver Cliente
                        </Button>
                      </Link>
                      <Link to="/sales/new">
                        <Button size="sm">Registrar Venta</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
