import { Link, useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { useCustomer } from "../hooks/useCustomer";

// Zod validation schema
const customerFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  company: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export const CustomerFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== "new";

  const {
    customer,
    isLoading,
    createCustomer,
    updateCustomer,
    isCreating,
    isUpdating,
  } = useCustomer(id!);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    values: customer
      ? {
          name: customer.name,
          company: customer.company ?? "",
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          address: customer.address ?? "",
          notes: customer.notes ?? "",
        }
      : undefined,
  });

  // Reset form when customer data is loaded in edit mode
  useEffect(() => {
    if (isEditing && customer) {
      reset({
        name: customer.name,
        company: customer.company ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        address: customer.address ?? "",
        notes: customer.notes ?? "",
      });
    }
  }, [isEditing, customer, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const payload = {
        name: data.name,
        company: data.company || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
      };

      if (isEditing) {
        await updateCustomer({ customerId: id, data: payload });
      } else {
        await createCustomer(payload);
      }
      navigate("/customers");
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  if (isEditing && isLoading) {
    return <p>Cargando información del cliente...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
        </h1>
        <p className="text-gray-600">
          {isEditing
            ? "Actualiza la información del cliente"
            : "Registra un nuevo cliente"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Customer Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>
              Completa los datos básicos y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    placeholder="Empresa S.A."
                    {...register("company")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@email.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="+52 123 456 7890"
                    {...register("phone")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Calle, Ciudad, Estado"
                  {...register("address")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Información adicional sobre el cliente..."
                  {...register("notes")}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating
                    ? "Guardando..."
                    : isEditing
                      ? "Actualizar Cliente"
                      : "Crear Cliente"}
                </Button>
                <Link to="/customers" className="w-full sm:w-auto">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Column - Purchase History */}
        <div className="space-y-6">
          {isEditing &&
            customer?.last_purchases &&
            customer.last_purchases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Compras</CardTitle>
                  <CardDescription>
                    Historial de compras recientes del cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customer.last_purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Fecha</p>
                            <p className="font-medium">
                              {purchase.date_formatted}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="font-bold text-lg">
                              ${purchase.total.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Productos:
                          </p>
                          {purchase.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                            >
                              <div>
                                <p className="font-medium">
                                  {item.product_name}
                                </p>
                                <p className="text-gray-500">
                                  x{item.quantity} @{item.unit_price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-medium">
                                ${item.subtotal.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <Link to={`/sales/${purchase.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              Ver Detalles Completos
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {isEditing &&
            customer?.next_purchases &&
            customer.next_purchases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Compras Estimadas</CardTitle>
                  <CardDescription>
                    Predicciones basadas en el historial de compras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Fecha Estimada</TableHead>
                        <TableHead>Última Cantidad</TableHead>
                        <TableHead>Intervalo (días)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.next_purchases.map((nextPurchase, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {nextPurchase.product_name}
                          </TableCell>
                          <TableCell>{nextPurchase.estimated_date}</TableCell>
                          <TableCell>{nextPurchase.last_quantity}</TableCell>
                          <TableCell>
                            {nextPurchase.avg_interval_days}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
};
