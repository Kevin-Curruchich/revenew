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
import { useProducts } from "../hooks/useProducts";

const getEarningLabel = (
  mode: "percent" | "fee",
  percent: string | number,
  feeAmount: string | number,
) => {
  if (mode === "percent") {
    return `${percent}%`;
  }

  const parsedFee =
    typeof feeAmount === "number" ? feeAmount : parseFloat(feeAmount);

  return `Q${parsedFee?.toFixed(2) || "0.00"}`;
};

export const ProductListPage = () => {
  const { data, isLoading } = useProducts({ offset: 0, limit: 10 });
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-gray-600">Administra tu inventario y catálogo</p>
        </div>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
          <Link to="/purchases/new" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              + Registrar Compra
            </Button>
          </Link>
          <Link to="/products/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">+ Nuevo Producto</Button>
          </Link>
        </div>
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
          {isLoading ? (
            <p>Cargando productos...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ganancia</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getEarningLabel(
                          product.earning_mode,
                          product.earning_percent,
                          product.earning_fee_amount,
                        )}
                      </Badge>
                    </TableCell>
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
                      <div className="flex justify-end gap-2">
                        <Link to={`/purchases/new?productId=${product.id}`}>
                          <Button variant="outline" size="sm">
                            Comprar
                          </Button>
                        </Link>
                        <Link to={`/products/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
