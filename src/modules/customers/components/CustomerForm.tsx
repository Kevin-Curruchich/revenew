import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { FormField } from "@/components/shared/FormField";
import { getErrorMessage } from "@/lib/errors";
import type { CustomerPayload } from "../actions/create-customer";
import type { Customer } from "../domain/customer";

const customerFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  company: z.string().trim(),
  email: z.union([z.literal(""), z.email("Email inválido").trim()]),
  phone: z.string().trim(),
  address: z.string().trim(),
  notes: z.string().trim(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const toFormValues = (customer?: Customer): CustomerFormValues => ({
  name: customer?.name ?? "",
  company: customer?.company ?? "",
  email: customer?.email ?? "",
  phone: customer?.phone ?? "",
  address: customer?.address ?? "",
  notes: customer?.notes ?? "",
});

/** Empty optional fields are sent as `null`, as the API expects. */
const toPayload = (values: CustomerFormValues): CustomerPayload => ({
  name: values.name,
  company: values.company || null,
  email: values.email || null,
  phone: values.phone || null,
  address: values.address || null,
  notes: values.notes || null,
});

interface CustomerFormProps {
  /** Existing customer when editing; omit to create a new one. */
  customer?: Customer;
  onSubmit: (payload: CustomerPayload) => Promise<unknown>;
}

export const CustomerForm = ({ customer, onSubmit }: CustomerFormProps) => {
  const isEditing = !!customer;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: toFormValues(customer),
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      setError("root", { message: getErrorMessage(error) });
    }
  });

  return (
    <form className="space-y-6" onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          label="Nombre Completo *"
          htmlFor="name"
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="Juan Pérez"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </FormField>

        <FormField label="Empresa" htmlFor="company">
          <Input
            id="company"
            placeholder="Empresa S.A."
            {...register("company")}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="cliente@email.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <FormField label="Teléfono" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            placeholder="+502 1234 5678"
            {...register("phone")}
          />
        </FormField>
      </div>

      <FormField label="Dirección" htmlFor="address">
        <Input
          id="address"
          placeholder="Calle, Ciudad, Departamento"
          {...register("address")}
        />
      </FormField>

      <FormField label="Notas" htmlFor="notes">
        <Textarea
          id="notes"
          placeholder="Información adicional sobre el cliente..."
          {...register("notes")}
        />
      </FormField>

      <FormErrorAlert message={errors.root?.message} />

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Actualizar Cliente"
              : "Crear Cliente"}
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link to="/customers">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
};
