import { useDeferredValue, useState } from "react";
import { Link } from "react-router";

import { usePurchases } from "../hooks/usePurchases";

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
import { formatCurrency } from "@/lib/formatters";

const getPurchaseStatusBadgeVariant = (status: string) => {
  if (status === "confirmed") {
    return "default";
  }

  if (status === "cancelled") {
    return "destructive";
  }

  return "secondary";
};

const getPurchaseStatusLabel = (status: string) => {
  if (status === "confirmed") {
    return "Confirmada";
  }

  if (status === "cancelled") {
    return "Cancelada";
  }

  return "Borrador";
};

export const PurchasesListPage = () => {
  const [supplierName, setSupplierName] = useState("");
  const deferredSupplierName = useDeferredValue(supplierName);
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = usePurchases({
    supplier_name: deferredSupplierName || undefined,
    status_filter: statusFilter === "all" ? undefined : statusFilter,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    offset: 0,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Compras</h1>
          <p className="text-gray-600">
            Registra abastecimiento para mantener el stock al día
          </p>
        </div>
        <Link to="/purchases/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">+ Nueva Compra</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
          <CardDescription>
            Compras registradas para reposición y control de inventario
          </CardDescription>
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Input
              value={supplierName}
              onChange={(event) => setSupplierName(event.target.value)}
              placeholder="Buscar por proveedor..."
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando compras...</p>
          ) : data?.data.length ? (
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
                      #{purchase.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{purchase.supplier_name}</TableCell>
                    <TableCell>{purchase.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                          {purchase.items.length} producto
                          {purchase.items.length !== 1 ? "s" : ""}
                        </Badge>
                        <span className="text-xs text-gray-500">
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
                      <Badge
                        variant={getPurchaseStatusBadgeVariant(purchase.status)}
                      >
                        {getPurchaseStatusLabel(purchase.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/purchases/${purchase.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center space-y-2">
              <p className="font-medium">No hay compras registradas.</p>
              <p className="text-sm text-gray-500">
                Crea una compra para incrementar stock desde el flujo de
                abastecimiento.
              </p>
            </div>
          )}

          {data?.meta.total ? (
            <p className="text-sm text-gray-500 pt-4">
              Total registradas: {data.meta.total}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
