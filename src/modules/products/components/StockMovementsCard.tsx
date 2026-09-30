import { Badge } from "@/components/ui/badge";
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
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/QueryStates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getMovementBadge } from "../helpers/product-labels";
import { useProductStockMovements } from "../hooks/useProductStockMovements";

export const StockMovementsCard = ({ productId }: { productId: string }) => {
  const { data, isPending, isError, error, refetch } = useProductStockMovements(
    productId,
    { limit: 20, offset: 0 },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Movimientos de Stock</CardTitle>
        <CardDescription>
          Entradas y salidas del inventario para este producto
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <LoadingState label="Cargando historial de stock..." />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data.data.length === 0 ? (
          <EmptyState title="No hay movimientos registrados para este producto." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cambio</TableHead>
                <TableHead className="text-right">Stock Anterior</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead>Referencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {movement.created_at_formatted ??
                      movement.created_at ??
                      "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={getMovementBadge(movement.movement_type)}
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {movement.quantity_change > 0 ? "+" : ""}
                    {movement.quantity_change}
                  </TableCell>
                  <TableCell className="text-right">
                    {movement.stock_before ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {movement.stock_after ?? "—"}
                  </TableCell>
                  <TableCell>
                    {movement.reference_type ? (
                      <Badge variant="outline">
                        {movement.reference_type}
                        {movement.reference_id
                          ? ` #${movement.reference_id.slice(0, 8)}`
                          : ""}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
