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
import type { Product } from "../domain/product";

const mockProducts: Product[] = [
  {
    id: 1,
    sku: "PRD-001",
    name: "Laptop Pro 15",
    description: "Laptop de alto rendimiento para profesionales",
    price: 1299.99,
    stock: 45,
    status: "active",
  },
  {
    id: 2,
    sku: "PRD-002",
    name: 'Monitor 4K 27"',
    description: "Monitor ultra HD con colores precisos",
    price: 399.5,
    stock: 12,
    status: "active",
  },
  {
    id: 3,
    sku: "PRD-003",
    name: "Teclado Mecánico",
    description: "Teclado mecánico con switches azules",
    price: 89.99,
    stock: 0,
    status: "inactive",
  },
  {
    id: 4,
    sku: "PRD-004",
    name: "Ratón Inalámbrico",
    description: "Ratón ergonómico con batería de larga duración",
    price: 45.0,
    stock: 120,
    status: "active",
  },
];

export const ProductListPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-gray-600">Administra tu inventario y catálogo</p>
        </div>
        <Link to="/products/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">+ Nuevo Producto</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
          <CardDescription>
            Todos los productos registrados en el sistema
          </CardDescription>
          <div className="pt-4">
            <Input
              placeholder="Buscar por nombre o SKU..."
              className="w-full sm:max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.stock > 10
                          ? "outline"
                          : product.stock > 0
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {product.stock} unid.
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                    >
                      {product.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/products/${product.id}`}>
                      <Button variant="ghost" size="sm">
                        Editar
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
