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
import type { NextPurchase } from "../domain/customer";

export const CustomerNextPurchases = ({
  purchases,
}: {
  purchases: NextPurchase[];
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Próximas Compras Estimadas</CardTitle>
      <CardDescription>
        Predicciones basadas en el historial de compras
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Fecha Estimada</TableHead>
            <TableHead>Última Cantidad</TableHead>
            <TableHead>Intervalo (días)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.product_id}>
              <TableCell className="font-medium">
                {purchase.product_name}
              </TableCell>
              <TableCell>{purchase.estimated_date}</TableCell>
              <TableCell>{purchase.last_quantity}</TableCell>
              <TableCell>{purchase.avg_interval_days}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
