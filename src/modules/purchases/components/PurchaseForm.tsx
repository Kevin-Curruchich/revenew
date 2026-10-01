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
import { DatePicker } from "@/components/shared/DatePicker";
import { FieldError, FormField } from "@/components/shared/FormField";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/formatters";
import type { PurchasePayload } from "../actions/create-purchase";
import {
  getPurchaseStatusBadge,
  isPurchaseEditable,
  type Purchase,
} from "../domain/purchase";
import {
  emptyPurchaseItem,
  getItemSubtotal,
  purchaseFormSchema,
  toPurchaseFormValues,
  toPurchasePayload,
  type PurchaseFormValues,
} from "./purchase-form-schema";
import { PurchaseItemRow, type PurchaseProductOption } from "./PurchaseItemRow";

interface PurchaseFormProps {
  purchase?: Purchase;
  /** Product preselected in the first row (e.g. `?productId=` in the URL). */
  presetProductId?: string;
  products: PurchaseProductOption[];
  onSubmit: (payload: PurchasePayload) => Promise<unknown>;
  /** Extra actions for existing purchases (confirm, cancel, delete...). */
  renderStatusActions?: (state: { isDirty: boolean }) => ReactNode;
}

export const PurchaseForm = ({
  purchase,
  presetProductId = "",
  products,
  onSubmit,
  renderStatusActions,
}: PurchaseFormProps) => {
  const isEditing = !!purchase;
  const readOnly = isEditing && !isPurchaseEditable(purchase);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: toPurchaseFormValues(purchase, presetProductId),
    disabled: readOnly,
  });
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });
  const total = (items ?? []).reduce(
    (sum, item) => sum + getItemSubtotal(item),
    0,
  );

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(toPurchasePayload(values));
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
                <CardDescription>
                  Datos básicos del proveedor y la fecha de compra
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  label="Proveedor *"
                  htmlFor="supplierName"
                  error={errors.supplierName?.message}
                >
                  <Input
                    id="supplierName"
                    placeholder="Ej. Distribuidora Norte"
                    aria-invalid={!!errors.supplierName}
                    {...register("supplierName")}
                  />
                </FormField>
                <FormField
                  label="Fecha de Compra *"
                  htmlFor="purchaseDate"
                  error={errors.purchaseDate?.message}
                >
                  <Controller
                    control={control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <DatePicker
                        id="purchaseDate"
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={!!errors.purchaseDate}
                        className="sm:w-full"
                      />
                    )}
                  />
                </FormField>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Productos Comprados</CardTitle>
                  <CardDescription>
                    Agrega los productos que ingresarán al inventario
                  </CardDescription>
                </div>
                {!readOnly ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append(emptyPurchaseItem())}
                  >
                    + Agregar Item
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <PurchaseItemRow
                    key={field.id}
                    index={index}
                    fieldId={field.id}
                    products={products}
                    readOnly={readOnly}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <StatusBadge
                    status={getPurchaseStatusBadge(purchase?.status ?? "draft")}
                  />
                </div>
                <div className="flex justify-between border-t pt-4 text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <FormErrorAlert message={errors.root?.message} />

            <div className="flex flex-col gap-4">
              {!readOnly ? (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || (isEditing && !isDirty)}
                >
                  {isSubmitting
                    ? "Guardando..."
                    : isEditing
                      ? "Guardar Cambios"
                      : "Crear Compra"}
                </Button>
              ) : null}
              {renderStatusActions?.({ isDirty })}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/purchases">Volver</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
