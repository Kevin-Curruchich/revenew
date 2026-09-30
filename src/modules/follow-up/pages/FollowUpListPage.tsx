import { Link } from "react-router";

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
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/QueryStates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useListSearchParams } from "@/hooks/useListSearchParams";
import { cn } from "@/lib/utils";
import {
  isFollowUpFilter,
  type FollowUpFilter,
} from "../actions/get-follow-ups";
import {
  formatDaysUntil,
  getFollowUpStatusBadge,
} from "../helpers/get-follow-up-status-badge";
import { useFollowUps } from "../hooks/useFollowUps";

const PAGE_SIZE = 10;

const filterOptions: { value: FollowUpFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "overdue", label: "Atrasados" },
  { value: "7_days", label: "7 días" },
  { value: "14_days", label: "14 días" },
  { value: "30_days", label: "30 días" },
];

export const FollowUpListPage = () => {
  const { offset, limit, getParam, setParams } = useListSearchParams(PAGE_SIZE);
  const filterParam = getParam("filter");
  // Ignore unknown values coming from a hand-edited URL.
  const filter: FollowUpFilter = isFollowUpFilter(filterParam)
    ? filterParam
    : "all";

  const { data, isPending, isError, error, refetch } = useFollowUps({
    filter,
    offset,
    limit,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seguimiento"
        description="Clientes que requieren atención"
      />

      <div className="flex flex-wrap gap-2 sm:gap-4" role="group">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? "default" : "outline"}
            aria-pressed={filter === option.value}
            onClick={() =>
              setParams({
                filter: option.value === "all" ? null : option.value,
              })
            }
            className="flex-1 sm:flex-none"
          >
            {option.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Seguimiento</CardTitle>
          <CardDescription>
            Ordenados por fecha de próxima compra estimada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <LoadingState label="Cargando seguimientos..." />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : data.data.length === 0 ? (
            <EmptyState title="No hay seguimientos para mostrar" />
          ) : (
            <>
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
                  {data.data.map((followUp) => {
                    // Items come sorted by estimated date: the first is the
                    // most urgent one.
                    const nextItem = followUp.items[0];
                    const daysUntil = nextItem?.days_until ?? null;

                    return (
                      <TableRow key={followUp.customer_id}>
                        <TableCell className="font-medium">
                          {followUp.customer}
                        </TableCell>
                        <TableCell>{followUp.email ?? "N/A"}</TableCell>
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
                          {nextItem?.estimated_next_purchase ?? "N/A"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              daysUntil !== null &&
                                daysUntil < 0 &&
                                "font-semibold text-destructive",
                            )}
                          >
                            {formatDaysUntil(daysUntil)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={getFollowUpStatusBadge(followUp.status)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/customers/${followUp.customer_id}`}>
                                Ver Cliente
                              </Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link
                                to={`/sales/new?customerId=${followUp.customer_id}`}
                              >
                                Registrar Venta
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Pagination total={data.meta.total} limit={limit} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
