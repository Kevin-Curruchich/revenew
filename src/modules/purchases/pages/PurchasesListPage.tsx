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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
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
import { formatCurrency, pluralize, shortId } from "@/lib/formatters";
import {
  getPurchaseStatusBadge,
  purchaseStatusBadges,
  type PurchaseStatus,
} from "../domain/purchase";
import { usePurchases } from "../hooks/usePurchases";

const PAGE_SIZE = 10;
const ALL_STATUSES = "all";

const isPurchaseStatus = (value: string): value is PurchaseStatus =>
  value in purchaseStatusBadges;

export const PurchasesListPage = () => {
  const { offset, limit, getParam, setParams } = useListSearchParams(PAGE_SIZE);
  const supplierName = getParam("supplier");
  const status = getParam("status");
  const startDate = getParam("start_date");
  const endDate = getParam("end_date");

  const { data, isPending, isError, error, refetch } = usePurchases({
    supplier_name: supplierName,
    status_filter: isPurchaseStatus(status) ? status : undefined,
    start_date: startDate,
    end_date: endDate,
    offset,
    limit,
  });

  const hasFilters = !!(supplierName || status || startDate || endDate);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras"
        description="Registra abastecimiento para mantener el stock al día"
        actions={
          <Button asChild>
            <Link to="/purchases/new">+ Nueva Compra</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
          <CardDescription>
            Compras registradas para reposición y control de inventario
          </CardDescription>
          <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-3">
            <SearchInput
              defaultValue={supplierName}
              onSearch={(value) => setParams({ supplier: value })}
              placeholder="Buscar por proveedor..."
              className="sm:max-w-none"
            />
            <Select
              value={status || ALL_STATUSES}
              onValueChange={(value) =>
                setParams({ status: value === ALL_STATUSES ? null : value })
              }
            >
              <SelectTrigger className="w-full" aria-label="Filtrar por estado">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>Todos los estados</SelectItem>
                {Object.entries(purchaseStatusBadges).map(([value, badge]) => (
                  <SelectItem key={value} value={value}>
                    {badge.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangePicker
              start={startDate}
              end={endDate}
              onChange={({ start, end }) =>
                setParams({ start_date: start, end_date: end })
              }
              className="sm:w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <LoadingState label="Cargando compras..." />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : data.data.length === 0 ? (
            <EmptyState
              title={
                hasFilters
                  ? "No hay compras que coincidan con los filtros."
                  : "No hay compras registradas."
              }
              description={
                hasFilters
                  ? undefined
                  : "Crea una compra para incrementar stock desde el flujo de abastecimiento."
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        {shortId(purchase.id)}
                      </TableCell>
                      <TableCell>{purchase.supplier_name}</TableCell>
                      <TableCell>{purchase.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline">
                            {pluralize(purchase.items.length, "producto")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {purchase.items
                              .map((item) => item.product_name)
                              .join(", ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(purchase.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={getPurchaseStatusBadge(purchase.status)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/purchases/${purchase.id}`}>Ver</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
