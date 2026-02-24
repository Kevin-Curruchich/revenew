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
import type { Customer } from "../domain/customer";

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan@email.com",
    phone: "+52 123 456 7890",
    lastPurchase: "2025-12-15",
    status: "active",
  },
  {
    id: 2,
    name: "María García",
    email: "maria@email.com",
    phone: "+52 098 765 4321",
    lastPurchase: "2025-11-28",
    status: "active",
  },
  {
    id: 3,
    name: "Carlos López",
    email: "carlos@email.com",
    phone: "+52 555 123 4567",
    lastPurchase: "2025-10-10",
    status: "inactive",
  },
  {
    id: 4,
    name: "Ana Martínez",
    email: "ana@email.com",
    phone: "+52 333 222 1111",
    lastPurchase: "2026-01-05",
    status: "active",
  },
];

export const CustomerListPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-600">Administra tu base de clientes</p>
        </div>
        <Link to="/customers/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">+ Nuevo Cliente</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Todos tus clientes registrados</CardDescription>
          <div className="pt-4">
            <Input
              placeholder="Buscar cliente..."
              className="w-full sm:max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.lastPurchase}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.status === "active" ? "default" : "secondary"
                      }
                    >
                      {customer.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/customers/${customer.id}`}>
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
