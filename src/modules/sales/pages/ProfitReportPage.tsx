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
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/QueryStates";
import { useListSearchParams } from "@/hooks/useListSearchParams";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { StatCard } from "@/modules/dashboard/components/StatCard";
import type { ProfitReportGroupBy } from "../actions/get-profit-report";
import {
  formatPercent,
  grossMarginPercent,
  profitRowLink,
} from "../helpers/profit";
import { useProfitReport } from "../hooks/useProfitReport";

const GROUP_BY_OPTIONS: { value: ProfitReportGroupBy; label: string }[] = [
  { value: "product", label: "Por producto" },
  { value: "customer", label: "Por cliente" },
  { value: "sale", label: "Por venta" },
];

const ROW_LABEL: Record<ProfitReportGroupBy, string> = {
  product: "Producto",
  customer: "Cliente",
  sale: "Venta",
};

const isGroupBy = (value: string): value is ProfitReportGroupBy =>
  GROUP_BY_OPTIONS.some((option) => option.value === value);

const formatQuantity = (value: number | string) =>
  Number(value).toLocaleString("es-GT", { maximumFractionDigits: 2 });

export const ProfitReportPage = () => {
  // No pagination: the report is a ranked summary, so the page size is unused.
  const { getParam, setParams } = useListSearchParams(1);
  const groupByParam = getParam("group_by");
  const groupBy: ProfitReportGroupBy = isGroupBy(groupByParam)
    ? groupByParam
    : "product";
  const startDate = getParam("start_date");
  const endDate = getParam("end_date");

  const { data, isPending, isError, error, refetch } = useProfitReport({
    group_by: groupBy,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  const totals = data?.totals;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ganancias"
        description="Ingresos y ganancia bruta de las ventas registradas"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Agrupar ganancias"
          className="inline-flex w-full rounded-md border border-border p-1 sm:w-auto"
        >
          {GROUP_BY_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={groupBy === option.value ? "default" : "ghost"}
              aria-pressed={groupBy === option.value}
              className="flex-1 sm:flex-none"
              onClick={() => setParams({ group_by: option.value })}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <DateRangePicker
          start={startDate}
          end={endDate}
          onChange={({ start, end }) =>
            setParams({ start_date: start, end_date: end })
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Ingresos"
          value={totals ? formatCurrency(totals.revenue) : "—"}
          detail={
            totals ? `${formatQuantity(totals.quantity)} unidades` : undefined
          }
        />
        <StatCard
          label="Ganancia bruta"
          value={totals ? formatCurrency(totals.gross_profit) : "—"}
        />
        <StatCard
          label="Margen"
          value={
            totals
              ? formatPercent(
                  grossMarginPercent(totals.revenue, totals.gross_profit),
                )
              : "—"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle por {ROW_LABEL[groupBy].toLowerCase()}</CardTitle>
          <CardDescription>
            De mayor a menor ganancia. Incluye ventas pendientes de pago.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <LoadingState label="Calculando ganancias..." />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : data.data.length === 0 ? (
            <EmptyState
              title="No hay ventas en este rango"
              description={
                startDate || endDate ? "Prueba con otras fechas." : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ROW_LABEL[groupBy]}</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((row) => {
                  const profit = Number(row.gross_profit);
                  return (
                    <TableRow key={row.key}>
                      <TableCell>
                        <Link
                          to={profitRowLink(groupBy, row.key)}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {row.label}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatQuantity(row.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold",
                          profit < 0 && "text-destructive",
                        )}
                      >
                        {formatCurrency(row.gross_profit)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatPercent(
                          grossMarginPercent(row.revenue, row.gross_profit),
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
