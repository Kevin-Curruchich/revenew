import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const DashboardPage = () => {
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
            <CardTitle className="text-3xl">125</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Ventas Este Mes</CardDescription>
            <CardTitle className="text-3xl">48</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Seguimiento Pendiente</CardDescription>
            <CardTitle className="text-3xl">23</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Compras Próximas (7 días)</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
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
            <div className="text-sm text-gray-600">
              Aquí se mostrará la lista de últimas ventas...
            </div>
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
            <div className="text-sm text-gray-600">
              Aquí se mostrarán los clientes que necesitan seguimiento...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
