import { useSearchParams } from "react-router";
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
import type { FollowUpStatus } from "../domain/follow-up";
import { useFollowUps } from "../hooks/useFollowUps";
import type { FollowUpFilter } from "../actions/get-follow-ups";

const getStatusBadge = (status: FollowUpStatus) => {
  const variants = {
    overdue: { variant: "destructive" as const, label: "Atrasado" },
    urgent: { variant: "default" as const, label: "Urgente" },
    upcoming: { variant: "secondary" as const, label: "Próximo" },
    normal: { variant: "outline" as const, label: "Normal" },
  };

  return variants[status as keyof typeof variants] || variants.normal;
};

export const FollowUpListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filter from query params, default to "all"
  const filterParam = searchParams.get("filter") as FollowUpFilter | null;
  const filter: FollowUpFilter = filterParam || "all";
  const { data, isLoading } = useFollowUps({ filter, offset: 0, limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Seguimiento</h1>
          <p className="text-gray-600">Clientes que requieren atención</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setSearchParams({ filter: "all" })}
          className="flex-1 sm:flex-none"
        >
          Todos
        </Button>
        <Button
          variant={filter === "overdue" ? "default" : "outline"}
          onClick={() => setSearchParams({ filter: "overdue" })}
          className="flex-1 sm:flex-none"
        >
          Atrasados
        </Button>
        <Button
          variant={filter === "7_days" ? "default" : "outline"}
          onClick={() => setSearchParams({ filter: "7_days" })}
          className="flex-1 sm:flex-none"
        >
          7 días
        </Button>
        <Button
          variant={filter === "14_days" ? "default" : "outline"}
          onClick={() => setSearchParams({ filter: "14_days" })}
          className="flex-1 sm:flex-none"
        >
          14 días
        </Button>
        <Button
          variant={filter === "30_days" ? "default" : "outline"}
          onClick={() => setSearchParams({ filter: "30_days" })}
          className="flex-1 sm:flex-none"
        >
          30 días
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Seguimiento</CardTitle>
          <CardDescription>
            Ordenados por fecha de próxima compra estimada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando seguimientos...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Próxima Compra Estimada</TableHead>
                  <TableHead>Días Restantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No hay seguimientos para mostrar
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((followUp) => {
                    const statusInfo = getStatusBadge(followUp.status);
                    return (
                      <TableRow key={followUp.customer_id}>
                        <TableCell className="font-medium">
                          {followUp.customer}
                        </TableCell>
                        <TableCell>{followUp.email || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {followUp.items.map((item) => (
                              <span key={item.product_id} className="text-sm">
                                {item.product_name}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {followUp.items[0]?.estimated_next_purchase || "N/A"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              followUp.items[0]?.days_until &&
                              followUp.items[0].days_until < 0
                                ? "text-red-600 font-semibold"
                                : ""
                            }
                          >
                            {followUp.items[0]?.days_until &&
                            followUp.items[0].days_until < 0
                              ? `${Math.abs(followUp.items[0].days_until)} días atrasado`
                              : `${followUp.items[0]?.days_until || 0} días`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link to={`/customers/${followUp.customer_id}`}>
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
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
