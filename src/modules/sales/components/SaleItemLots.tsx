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
import { formatShortDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";
import type { Sale } from "../domain/sale";

/** Which purchase lots each item of a saved sale was taken from. */
export const SaleItemLots = ({ sale }: { sale: Sale }) => {
  const rows = sale.items.flatMap((item) =>
    (item.allocations ?? []).map((allocation) => ({ item, allocation })),
  );
  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lotes usados</CardTitle>
        <CardDescription>
          De qué compra salió cada producto de esta venta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Fecha de compra</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Costo unitario</TableHead>
              <TableHead className="text-right">Compra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ item, allocation }) => (
              <TableRow key={allocation.id}>
                <TableCell className="font-medium">
                  {item.product_name}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatShortDate(allocation.lot_purchase_date)}
                </TableCell>
                <TableCell className="text-right">
                  {Number(allocation.quantity_allocated).toLocaleString(
                    "es-GT",
                    { maximumFractionDigits: 2 },
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(allocation.unit_cost_snapshot)}
                </TableCell>
                <TableCell className="text-right">
                  {allocation.purchase_id ? (
                    <Link
                      to={`/purchases/${allocation.purchase_id}`}
                      className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Ver
                    </Link>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
