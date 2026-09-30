import { useNavigate, useParams } from "react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState, LoadingState } from "@/components/shared/QueryStates";
import type { CustomerPayload } from "../actions/create-customer";
import { CustomerForm } from "../components/CustomerForm";
import { CustomerNextPurchases } from "../components/CustomerNextPurchases";
import { CustomerPurchaseHistory } from "../components/CustomerPurchaseHistory";
import {
  useCreateCustomer,
  useCustomer,
  useUpdateCustomer,
} from "../hooks/useCustomer";

export const CustomerFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const customerQuery = useCustomer(id);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const handleSubmit = async (payload: CustomerPayload) => {
    if (id) {
      await updateCustomer.mutateAsync({ id, data: payload });
    } else {
      await createCustomer.mutateAsync(payload);
    }
    navigate("/customers");
  };

  if (isEditing && customerQuery.isPending) {
    return <LoadingState label="Cargando información del cliente..." />;
  }

  if (isEditing && customerQuery.isError) {
    return (
      <ErrorState
        error={customerQuery.error}
        title="No se pudo cargar el cliente"
        onRetry={() => customerQuery.refetch()}
      />
    );
  }

  const customer = customerQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/customers"
        title={isEditing ? "Editar Cliente" : "Nuevo Cliente"}
        description={
          isEditing
            ? "Actualiza la información del cliente"
            : "Registra un nuevo cliente"
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>
              Completa los datos básicos y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* `key` remounts the form (fresh default values) per customer. */}
            <CustomerForm
              key={customer?.id ?? "new"}
              customer={customer}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {customer?.last_purchases?.length ? (
            <CustomerPurchaseHistory purchases={customer.last_purchases} />
          ) : null}
          {customer?.next_purchases?.length ? (
            <CustomerNextPurchases purchases={customer.next_purchases} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
