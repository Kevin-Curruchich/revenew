import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { FieldError, FormField } from "@/components/shared/FormField";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/formatters";
import type { SalePayload } from "../actions/create-sale";
import type { Sale } from "../domain/sale";
import {
  emptySaleItem,
  getItemSubtotal,
  saleFormSchema,
  toSalePayload,
  type SaleFormValues,
} from "./sale-form-schema";
import { SaleItemRow, type SaleProductOption } from "./SaleItemRow";

export interface CustomerOption {
  id: string;
  name: string;
}

interface SaleFormProps {
  sale?: Sale;
  defaultValues: SaleFormValues;
  customers: CustomerOption[];
  products: SaleProductOption[];
  onSubmit: (payload: SalePayload) => Promise<unknown>;
  /** Extra content for the summary card (e.g. payment status). */
  summaryExtra?: ReactNode;
}

export const SaleForm = ({
  sale,
  defaultValues,
  customers,
  products,
  onSubmit,
  summaryExtra,
}: SaleFormProps) => {
  const isEditing = !!sale;

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues,
  });
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });
  const total = (items ?? []).reduce(
    (sum, item) => sum + getItemSubtotal(item),
    0,
  );

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(toSalePayload(values));
    } catch (error) {
      setError("root", { message: getErrorMessage(error) });
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>Datos básicos de la venta</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  label="Cliente *"
                  htmlFor="customerId"
                  error={errors.customerId?.message}
                >
                  {sale ? (
                    <Input
                      id="customerId"
                      value={sale.customer_name}
                      disabled
                    />
                  ) : (
                    <Controller
                      name="customerId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="customerId"
                            className="w-full"
                            aria-invalid={!!errors.customerId}
                          >
                            <SelectValue placeholder="Selecciona un cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>

                <FormField
                  label="Fecha de Venta *"
                  htmlFor="saleDate"
                  error={errors.saleDate?.message}
                >
                  <Input
                    id="saleDate"
                    type="date"
                    disabled={isEditing}
                    aria-invalid={!!errors.saleDate}
                    {...register("saleDate")}
                  />
                </FormField>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Items de Venta</CardTitle>
                  <CardDescription>
                    Agrega los productos o servicios vendidos
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append(emptySaleItem())}
                >
                  + Agregar Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <SaleItemRow
                    key={field.id}
                    index={index}
                    fieldId={field.id}
                    products={products}
                    canRemove={fields.length > 1}
                    onRemove={() => remove(index)}
                  />
                ))}
                <FieldError message={errors.items?.root?.message} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-semibold">{fields.length}</span>
                </div>
                <div className="flex justify-between border-t pt-4 text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold">{formatCurrency(total)}</span>
                </div>
                {summaryExtra}
              </CardContent>
            </Card>

            <FormErrorAlert message={errors.root?.message} />

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar Venta"
                    : "Registrar Venta"}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/sales">Cancelar</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
