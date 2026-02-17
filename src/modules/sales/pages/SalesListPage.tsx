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

const mockSales = [
  {
    id: 1,
    customer: "Juan Pérez",
    date: "2026-01-15",
    total: "$2,450.00",
    items: 3,
    nextPurchase: "2026-02-15",
  },
  {
    id: 2,
    customer: "María García",
    date: "2026-01-18",
    total: "$1,890.00",
    items: 2,
    nextPurchase: "2026-02-20",
  },
  {
    id: 3,
    customer: "Carlos López",
    date: "2026-01-10",
    total: "$3,200.00",
    items: 5,
    nextPurchase: "2026-02-10",
  },
  {
    id: 4,
    customer: "Ana Martínez",
    date: "2026-01-20",
    total: "$950.00",
    items: 1,
    nextPurchase: "2026-02-22",
  },
];

export const SalesListPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ventas</h1>
          <p className="text-gray-600">Historial de ventas registradas</p>
        </div>
        <Link to="/sales/new">
          <Button>+ Nueva Venta</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
          <CardDescription>
            Todas las ventas registradas en el sistema
          </CardDescription>
          <div className="pt-4 flex gap-4">
            <Input placeholder="Buscar por cliente..." className="max-w-sm" />
            <Input type="date" className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Próxima Compra Estimada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">#{sale.id}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sale.items} items</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{sale.total}</TableCell>
                  <TableCell>{sale.nextPurchase}</TableCell>
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
