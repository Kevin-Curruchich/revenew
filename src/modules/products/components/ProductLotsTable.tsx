import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/QueryStates";
import { formatShortDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";
import { summarizeLots } from "../domain/product-lot";
import { useProductLots } from "../hooks/useProductLots";

const formatUnits = (value: number | string) =>
  Number(value).toLocaleString("es-GT", { maximumFractionDigits: 2 });

/** Stock lots of a product, oldest first: the next sale takes from the top. */
export const ProductLotsTable = ({ productId }: { productId: string }) => {
  const { data, isPending, isError, error, refetch } =
    useProductLots(productId);

  if (isPending) return <LoadingState label="Cargando lotes..." />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (data.lots.length === 0) {
    return (
      <EmptyState
        title="Sin lotes disponibles"
        description="Registra una compra confirmada para agregar stock."
      />
    );
  }

  const summary = summarizeLots(data.lots);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span>
          <span className="text-muted-foreground">Unidades en lotes: </span>
          <span className="font-semibold">{formatUnits(summary.units)}</span>
        </span>
        <span>
          <span className="text-muted-foreground">Costo del inventario: </span>
          <span className="font-semibold">{formatCurrency(summary.cost)}</span>
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha de compra</TableHead>
            <TableHead className="text-right">Disponible</TableHead>
            <TableHead className="text-right">Costo unitario</TableHead>
            <TableHead className="text-right">Precio sugerido</TableHead>
            <TableHead className="text-right">Compra</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.lots.map((lot, index) => (
            <TableRow key={lot.purchase_item_id}>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {formatShortDate(lot.purchase_date)}
                  {index === 0 ? (
                    <Badge
                      variant="secondary"
                      title="La próxima venta sale de este lote"
                    >
                      Siguiente
                    </Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatUnits(lot.remaining_quantity)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(lot.unit_cost)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(lot.suggested_unit_price)}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  to={`/purchases/${lot.purchase_id}`}
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Ver
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
