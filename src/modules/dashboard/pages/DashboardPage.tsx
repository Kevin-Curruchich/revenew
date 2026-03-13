import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency } from "@/lib/formatters";
import { getFollowUpStatusBadge } from "@/modules/follow-up/helpers/get-follow-up-status-badge";

import { useDashboardSummary } from "../hooks/useDashboardSummary";

export const DashboardPage = () => {
  const { data, isLoading, isError, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner label="Cargando resumen del dashboard..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No se pudo cargar el dashboard</CardTitle>
          <CardDescription>
            {error instanceof Error
              ? error.message
              : "Ocurrió un error al obtener el resumen."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Resumen de tu negocio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Clientes</CardDescription>
            <CardTitle className="text-3xl">{data.totalCustomers}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Ventas Este Mes</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(data.salesThisMonth)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Seguimiento Pendiente</CardDescription>
            <CardTitle className="text-3xl">{data.pendingFollowUps}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Compras Próximas (7 días)</CardDescription>
            <CardTitle className="text-3xl">
              {data.upcomingPurchases7Days}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Ventas</CardTitle>
            <CardDescription>Ventas recientes registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentSales.length === 0 ? (
              <p className="text-sm text-gray-600">No hay ventas recientes.</p>
            ) : (
              <div className="space-y-3">
                {data.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{sale.customer_name}</p>
                      <p className="text-xs text-gray-500">
                        {sale.created_at_formatted} • {sale.items.length}{" "}
                        producto
                        {sale.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(sale.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes Prioritarios</CardTitle>
            <CardDescription>
              Clientes que requieren seguimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.priorityCustomers.length === 0 ? (
              <p className="text-sm text-gray-600">
                No hay clientes prioritarios en este momento.
              </p>
            ) : (
              <div className="space-y-4">
                {data.priorityCustomers.map((customer) => {
                  const statusInfo = getFollowUpStatusBadge(customer.status);

                  return (
                    <div
                      key={customer.customer_id}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{customer.customer}</p>
                          <p className="text-xs text-gray-500">
                            {customer.email ?? "Sin correo electrónico"}
                          </p>
                        </div>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-2">
                        {customer.items.map((item) => (
                          <div
                            key={item.product_id}
                            className="flex items-start justify-between gap-3 text-sm"
                          >
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-xs text-gray-500">
                                Próxima compra:{" "}
                                {item.estimated_next_purchase ?? "N/A"}
                              </p>
                            </div>
                            {item.stock_alert ? (
                              <Badge variant="destructive">Stock bajo</Badge>
                            ) : (
                              <Badge variant="outline">Stock OK</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
