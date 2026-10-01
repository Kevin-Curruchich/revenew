import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState, LoadingState } from "@/components/shared/QueryStates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, pluralize } from "@/lib/formatters";
import { getFollowUpStatusBadge } from "@/modules/follow-up/helpers/get-follow-up-status-badge";
import { StatCard } from "../components/StatCard";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

export const DashboardPage = () => {
  const { data, isPending, isError, error, refetch } = useDashboardSummary();

  if (isPending) {
    return <LoadingState label="Cargando resumen del dashboard..." />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        title="No se pudo cargar el dashboard"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Resumen de tu negocio" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Clientes" value={data.totalCustomers} />
        <StatCard
          label="Ventas Este Mes"
          value={formatCurrency(data.salesThisMonth)}
        />
        <StatCard
          label="Por cobrar"
          value={formatCurrency(data.pendingPaymentsTotal ?? 0)}
          detail={pluralize(
            data.pendingPaymentsCount ?? 0,
            "venta pendiente",
            "ventas pendientes",
          )}
          to="/sales?is_payment_pending=true"
        />
        <StatCard label="Seguimiento Pendiente" value={data.pendingFollowUps} />
        <StatCard
          label="Compras Próximas (7 días)"
          value={data.upcomingPurchases7Days}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Ventas</CardTitle>
            <CardDescription>Ventas recientes registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay ventas recientes.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.recentSales.map((sale) => (
                  <li key={sale.id}>
                    <Link
                      to={`/sales/${sale.id}`}
                      className="-mx-2 flex items-center justify-between rounded-md border-b px-2 py-2 transition-colors hover:bg-accent"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{sale.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sale.created_at_formatted} •{" "}
                          {pluralize(sale.items.length, "producto")}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(sale.total)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
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
              <p className="text-sm text-muted-foreground">
                No hay clientes prioritarios en este momento.
              </p>
            ) : (
              <div className="space-y-4">
                {data.priorityCustomers.map((customer) => (
                  <div
                    key={customer.customer_id}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Link
                          to={`/customers/${customer.customer_id}`}
                          className="font-medium hover:underline"
                        >
                          {customer.customer}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {customer.email ?? "Sin correo electrónico"}
                        </p>
                      </div>
                      <StatusBadge
                        status={getFollowUpStatusBadge(customer.status)}
                      />
                    </div>

                    <div className="mt-3 space-y-2">
                      {customer.items.map((item) => (
                        <div
                          key={item.product_id}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
