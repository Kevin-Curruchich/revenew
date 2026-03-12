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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";

import { useSales } from "../hooks/useSales";

export const SalesListPage = () => {
  const { data } = useSales({ offset: 0, limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ventas</h1>
          <p className="text-gray-600">Historial de ventas registradas</p>
        </div>
        <Link to="/sales/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">+ Nueva Venta</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
          <CardDescription>
            Todas las ventas registradas en el sistema
          </CardDescription>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar por cliente..."
              className="w-full sm:max-w-sm"
            />
            <Input type="date" className="w-full sm:max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    #{sale.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{sale.customer_name}</span>
                      {sale.customer_company && (
                        <span className="text-xs text-gray-500">
                          {sale.customer_company}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit">
                        {sale.items.length} producto
                        {sale.items.length !== 1 ? "s" : ""}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {sale.items.map((item) => item.product_name).join(", ")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${sale.total.toFixed(2)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Link to={`/sales/${sale.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
