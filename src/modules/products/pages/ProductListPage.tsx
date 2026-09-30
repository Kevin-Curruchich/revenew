import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/QueryStates";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useListSearchParams } from "@/hooks/useListSearchParams";
import { formatCurrency } from "@/lib/formatters";
import {
  getEarningLabel,
  getStockAlertStatus,
  productStatusBadge,
  stockAlertBadge,
} from "../helpers/product-labels";
import { useProducts } from "../hooks/useProducts";

const PAGE_SIZE = 10;

export const ProductListPage = () => {
  const { offset, limit, getParam, setParams } = useListSearchParams(PAGE_SIZE);
  const search = getParam("search");

  const { data, isPending, isError, error, refetch } = useProducts({
    offset,
    limit,
    search,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Administra tu inventario y catálogo"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/purchases/new">+ Registrar Compra</Link>
            </Button>
            <Button asChild>
              <Link to="/products/new">+ Nuevo Producto</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
          <CardDescription>
            Todos los productos registrados en el sistema
          </CardDescription>
          <div className="pt-4">
            <SearchInput
              defaultValue={search}
              onSearch={(value) => setParams({ search: value })}
              placeholder="Buscar por nombre o SKU..."
            />
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <LoadingState label="Cargando productos..." />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : data.data.length === 0 ? (
            <EmptyState
              title="No se encontraron productos"
              description={
                search
                  ? "Prueba con otro término de búsqueda."
                  : "Registra tu primer producto para empezar."
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Ganancia</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((product) => {
                    const stockAlert = getStockAlertStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.sku}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          {formatCurrency(product.suggested_price)}
                        </TableCell>
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
                            variant={stockAlertBadge[stockAlert].variant}
                            title={stockAlertBadge[stockAlert].label}
                          >
                            {product.stock} unid.
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={productStatusBadge[product.status]}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                to={`/purchases/new?productId=${product.id}`}
                              >
                                Comprar
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/products/${product.id}`}>Editar</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Pagination total={data.meta.total} limit={limit} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
