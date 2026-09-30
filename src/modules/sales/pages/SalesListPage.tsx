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
import { Input } from "@/components/ui/input";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/QueryStates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useListSearchParams } from "@/hooks/useListSearchParams";
import { formatCurrency, pluralize, shortId } from "@/lib/formatters";
import { useCustomers } from "@/modules/customers/hooks/useCustomers";
import { getPaymentStatusBadge } from "../domain/sale";
import { useSales } from "../hooks/useSales";

const PAGE_SIZE = 10;
const ALL_CUSTOMERS = "all";
// TODO: replace with a searchable combobox once there are many customers.
const CUSTOMER_OPTIONS_LIMIT = 200;

export const SalesListPage = () => {
  const { offset, limit, getParam, setParams } = useListSearchParams(PAGE_SIZE);
  const customerId = getParam("customer_id");
  const startDate = getParam("start_date");
  const endDate = getParam("end_date");

  const { data, isPending, isError, error, refetch } = useSales({
    offset,
    limit,
    customer_id: customerId,
    start_date: startDate,
    end_date: endDate,
  });
  const { data: customersData } = useCustomers({
    limit: CUSTOMER_OPTIONS_LIMIT,
  });

  const hasFilters = !!(customerId || startDate || endDate);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description="Historial de ventas registradas"
        actions={
          <Button asChild>
            <Link to="/sales/new">+ Nueva Venta</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
          <CardDescription>
            Todas las ventas registradas en el sistema
          </CardDescription>
          <div className="flex flex-col flex-wrap gap-4 pt-4 sm:flex-row">
            <Select
              value={customerId || ALL_CUSTOMERS}
              onValueChange={(value) =>
                setParams({
                  customer_id: value === ALL_CUSTOMERS ? null : value,
                })
              }
            >
              <SelectTrigger
                className="w-full sm:w-56"
                aria-label="Filtrar por cliente"
              >
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CUSTOMERS}>
                  Todos los clientes
                </SelectItem>
                {customersData?.data.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                    {customer.company ? ` · ${customer.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="w-full sm:w-auto"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) =>
                  setParams({ start_date: event.target.value })
                }
                aria-label="Fecha inicio"
              />
              <span className="shrink-0 text-sm text-muted-foreground">—</span>
              <Input
                type="date"
                className="w-full sm:w-auto"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) =>
                  setParams({ end_date: event.target.value })
                }
                aria-label="Fecha fin"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <LoadingState label="Cargando ventas..." />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : data.data.length === 0 ? (
            <EmptyState
              title="No se encontraron ventas"
              description={
                hasFilters ? "Prueba ajustando los filtros." : undefined
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {shortId(sale.id)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {sale.customer_name}
                          </span>
                          {sale.customer_company ? (
                            <span className="text-xs text-muted-foreground">
                              {sale.customer_company}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline">
                            {pluralize(sale.items.length, "producto")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {sale.items
                              .map((item) => item.product_name)
                              .join(", ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={getPaymentStatusBadge(
                            sale.is_payment_pending,
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/sales/${sale.id}`}>Ver</Link>
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
