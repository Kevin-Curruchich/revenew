import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import type { LastPurchase } from "../domain/customer";

export const CustomerPurchaseHistory = ({
  purchases,
}: {
  purchases: LastPurchase[];
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Últimas Compras</CardTitle>
      <CardDescription>
        Historial de compras recientes del cliente
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">{purchase.date_formatted}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold">
                {formatCurrency(purchase.total)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Productos:</p>
            {purchase.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between rounded bg-muted p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to={`/sales/${purchase.id}`}>Ver Detalles Completos</Link>
          </Button>
        </div>
      ))}
    </CardContent>
  </Card>
);
