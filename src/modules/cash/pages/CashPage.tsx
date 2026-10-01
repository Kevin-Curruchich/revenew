import { Link } from "react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { StatCard } from "@/modules/dashboard/components/StatCard";
import {
  formatMovementDate,
  getCashMovementTypeBadge,
  signedAmount,
  type CashMovement,
} from "../domain/cash";
import { useCashMovements } from "../hooks/useCashMovements";
import { useCashSummary } from "../hooks/useCashSummary";

const PAGE_SIZE = 20;

const MovementConcept = ({ movement }: { movement: CashMovement }) => (
  <div className="flex flex-col gap-0.5">
    {movement.sale_id ? (
      <Link
        to={`/sales/${movement.sale_id}`}
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        Venta
      </Link>
    ) : movement.purchase_id ? (
      <Link
        to={`/purchases/${movement.purchase_id}`}
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        Compra
      </Link>
    ) : null}
    {movement.note ? (
      <span className="text-xs text-muted-foreground">{movement.note}</span>
    ) : null}
    {!movement.sale_id && !movement.purchase_id && !movement.note ? (
      <span className="text-muted-foreground">—</span>
    ) : null}
  </div>
);

export const CashPage = () => {
  const { offset, limit, getParam, setParams } = useListSearchParams(PAGE_SIZE);
  const startDate = getParam("start_date");
  const endDate = getParam("end_date");

  const summary = useCashSummary();
  const { data, isPending, isError, error, refetch } = useCashMovements({
    start_date: startDate,
    end_date: endDate,
    offset,
    limit,
  });

  const hasFilters = !!(startDate || endDate);

  return (
    <div className="space-y-6">
      <PageHeader title="Caja" description="Movimientos de efectivo del negocio" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          label="Saldo en caja"
          value={summary.data ? formatCurrency(summary.data.balance) : "—"}
        />
        <StatCard
          label="Saldo del socio (aportes − retiros)"
          value={
            summary.data ? formatCurrency(summary.data.owner_balance) : "—"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
          <CardDescription>Del más reciente al más antiguo</CardDescription>
          <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center">
            <Input
              type="date"
              className="w-full sm:w-auto"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) =>
                setParams({ start_date: event.target.value })
              }
              aria-label="Fecha inicio"
            />
            <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
              —
            </span>
            <Input
              type="date"
              className="w-full sm:w-auto"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setParams({ end_date: event.target.value })}
              aria-label="Fecha fin"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <LoadingState label="Cargando movimientos..." />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : data.data.length === 0 ? (
            <EmptyState
              title="No hay movimientos de caja"
              description={
                hasFilters ? "Prueba ajustando las fechas." : undefined
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((movement) => {
                    const amount = signedAmount(movement);
                    return (
                      <TableRow key={movement.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatMovementDate(movement.occurred_at)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={getCashMovementTypeBadge(movement.type)}
                          />
                        </TableCell>
                        <TableCell>
                          <MovementConcept movement={movement} />
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold whitespace-nowrap",
                            amount < 0
                              ? "text-destructive"
                              : "text-emerald-600 dark:text-emerald-400",
                          )}
                        >
                          {amount > 0 ? "+" : ""}
                          {formatCurrency(amount)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(movement.running_balance)}
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
