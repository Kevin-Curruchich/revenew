import { Link } from "react-router";

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
import { useListSearchParams } from "@/hooks/useListSearchParams";
import { useCustomers } from "../hooks/useCustomers";

const PAGE_SIZE = 10;

export const CustomerListPage = () => {
  const { offset, limit, getParam, setParams } = useListSearchParams(PAGE_SIZE);
  const search = getParam("search");

  const { data, isPending, isError, error, refetch } = useCustomers({
    offset,
    limit,
    search,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Administra tu base de clientes"
        actions={
          <Button asChild>
            <Link to="/customers/new">+ Nuevo Cliente</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Todos tus clientes registrados</CardDescription>
          <div className="pt-4">
            <SearchInput
              defaultValue={search}
              onSearch={(value) => setParams({ search: value })}
              placeholder="Buscar cliente..."
            />
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <LoadingState label="Cargando clientes..." />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : data.data.length === 0 ? (
            <EmptyState
              title="No se encontraron clientes"
              description={
                search
                  ? "Prueba con otro término de búsqueda."
                  : "Registra tu primer cliente para empezar."
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead className="text-right">Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>{customer.email ?? "—"}</TableCell>
                      <TableCell>{customer.phone ?? "—"}</TableCell>
                      <TableCell>{customer.address ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {customer.created_at_formatted}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/customers/${customer.id}`}>Ver</Link>
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
