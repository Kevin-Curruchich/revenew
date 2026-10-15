import { Link } from "react-router";

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
import { ErrorState, LoadingState } from "@/components/shared/QueryStates";
import { formatCurrency } from "@/lib/formatters";
import { useCapitalReport } from "@/modules/products/hooks/useCapitalReport";
import { netCapital } from "../domain/cash";
import { useCashSummary } from "../hooks/useCashSummary";

const formatUnits = (value: string) =>
  Number(value).toLocaleString("es-GT", { maximumFractionDigits: 2 });

const CapitalLine = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className={strong ? "font-semibold" : "text-muted-foreground"}>
      {label}
    </span>
    <span className={strong ? "font-semibold" : undefined}>{value}</span>
  </div>
);

/** Where the business's money is: cash, stock and receivables, by product. */
export const CapitalCard = () => {
  const report = useCapitalReport();
  const cash = useCashSummary();
  const data = report.data;
  const summary = cash.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capital del negocio</CardTitle>
        <CardDescription>
          Caja + inventario + por cobrar − saldo del socio, al día de hoy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {report.isError || cash.isError ? (
          <ErrorState
            error={report.error ?? cash.error}
            onRetry={() => {
              void report.refetch();
              void cash.refetch();
            }}
          />
        ) : !data || !summary ? (
          <LoadingState label="Calculando capital..." />
        ) : (
          <>
            <div className="max-w-sm space-y-1">
              <CapitalLine
                label="Caja"
                value={formatCurrency(summary.balance)}
              />
              <CapitalLine
                label="Inventario (a costo)"
                value={formatCurrency(data.totals.inventory_value)}
              />
              <CapitalLine
                label="Por cobrar"
                value={formatCurrency(data.totals.receivable)}
              />
              <CapitalLine
                label="− Saldo del socio"
                value={formatCurrency(summary.owner_balance)}
              />
              <div className="border-t pt-1">
                <CapitalLine
                  label="Capital neto"
                  value={formatCurrency(netCapital(summary, data.totals))}
                  strong
                />
              </div>
            </div>

            {data.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Inventario</TableHead>
                    <TableHead className="text-right">Por cobrar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((row) => (
                    <TableRow key={row.product_id}>
                      <TableCell>
                        <Link
                          to={`/products/${row.product_id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {row.product_name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {row.product_sku}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatUnits(row.stock)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.inventory_value)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.receivable)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
};
