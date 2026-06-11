import { useCallback } from "react";
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
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useSearchParams } from "react-router";
import { formatCurrency } from "@/lib/formatters";

import { useSales } from "../hooks/useSales";
import { useCustomers } from "@/modules/customers/hooks/useCustomers";

const LIMIT = 10;

export const SalesListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const customer = searchParams.get("customer") ?? "";
  const customer_id = searchParams.get("customer_id") ?? "";
  const start_date = searchParams.get("start_date") ?? "";
  const end_date = searchParams.get("end_date") ?? "";
  const offset = (page - 1) * LIMIT;

  const { data, isLoading } = useSales({
    offset,
    limit: LIMIT,
    customer,
    customer_id,
    start_date,
    end_date,
  });
  const { data: customersData } = useCustomers({ limit: 200 });

  const setParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        // Reset to page 1 when filters change
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

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
          <div className="pt-4 flex flex-col sm:flex-row gap-4 flex-wrap">
            <Select
              value={customer_id}
              onValueChange={(val) =>
                setParam("customer_id", val === "all" ? "" : val)
              }
            >
              <SelectTrigger className="w-full sm:w-55">
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {customersData?.data.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.company ? ` · ${c.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="w-full sm:w-auto"
                value={start_date}
                onChange={(e) => setParam("start_date", e.target.value)}
                title="Fecha inicio"
              />
              <span className="text-muted-foreground text-sm shrink-0">—</span>
              <Input
                type="date"
                className="w-full sm:w-auto"
                value={end_date}
                onChange={(e) => setParam("end_date", e.target.value)}
                title="Fecha fin"
              />
            </div>
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
                <TableHead>Pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Cargando ventas...
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron ventas
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      #{sale.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {sale.customer_name}
                        </span>
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
                      <Badge
                        variant={
                          sale.is_payment_pending ? "secondary" : "default"
                        }
                      >
                        {sale.is_payment_pending ? "Pendiente" : "Pagado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/sales/${sale.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && <Pagination total={data.meta.total} limit={LIMIT} />}
        </CardContent>
      </Card>
    </div>
  );
};
