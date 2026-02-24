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
import type { Sale } from "../domain/sale";
import type { Product } from "../../products/domain/product";

const mockProducts: Record<number, Product> = {
  1: {
    id: 1,
    sku: "PRD-001",
    name: "Laptop Pro 15",
    description: "",
    price: 1299.99,
    stock: 45,
    status: "active",
  },
  2: {
    id: 2,
    sku: "PRD-002",
    name: 'Monitor 4K 27"',
    description: "",
    price: 399.5,
    stock: 12,
    status: "active",
  },
  3: {
    id: 3,
    sku: "PRD-003",
    name: "Teclado Mecánico",
    description: "",
    price: 89.99,
    stock: 0,
    status: "inactive",
  },
  4: {
    id: 4,
    sku: "PRD-004",
    name: "Ratón Inalámbrico",
    description: "",
    price: 45.0,
    stock: 120,
    status: "active",
  },
};

const mockSales: Sale[] = [
  {
    id: 1,
    customer: "Juan Pérez",
    date: "2026-01-15",
    total: "$2,450.00",
    items: [
      {
        productId: 1,
        product: mockProducts[1],
        quantity: 1,
        unitPrice: 1299.99,
        subtotal: 1299.99,
      },
      {
        productId: 2,
        product: mockProducts[2],
        quantity: 2,
        unitPrice: 575.0,
        subtotal: 1150.01,
      },
    ],
    nextPurchase: "2026-02-15",
  },
  {
    id: 2,
    customer: "María García",
    date: "2026-01-18",
    total: "$1,890.00",
    items: [
      {
        productId: 3,
        product: mockProducts[3],
        quantity: 2,
        unitPrice: 945.0,
        subtotal: 1890.0,
      },
    ],
    nextPurchase: "2026-02-20",
  },
  {
    id: 3,
    customer: "Carlos López",
    date: "2026-01-10",
    total: "$3,200.00",
    items: [
      {
        productId: 1,
        product: mockProducts[1],
        quantity: 2,
        unitPrice: 1299.99,
        subtotal: 2599.98,
      },
      {
        productId: 4,
        product: mockProducts[4],
        quantity: 3,
        unitPrice: 200.0,
        subtotal: 600.02,
      },
    ],
    nextPurchase: "2026-02-10",
  },
  {
    id: 4,
    customer: "Ana Martínez",
    date: "2026-01-20",
    total: "$950.00",
    items: [
      {
        productId: 2,
        product: mockProducts[2],
        quantity: 1,
        unitPrice: 950.0,
        subtotal: 950.0,
      },
    ],
    nextPurchase: "2026-02-22",
  },
];

export const SalesListPage = () => {
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
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit">
                        {sale.items.length} items
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {sale.items
                          .map((item) => item.product?.name)
                          .join(", ")}
                      </span>
                    </div>
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
