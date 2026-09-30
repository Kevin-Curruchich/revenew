import { Link } from "react-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { FormField } from "@/components/shared/FormField";
import { getErrorMessage } from "@/lib/errors";
import type { ProductPayload } from "../actions/create-product";
import type { Product } from "../domain/product";

const numberField = (message: string) =>
  z.number({ error: "Ingresa un número válido" }).min(0, message);

const productFormSchema = z.object({
  sku: z.string().trim().min(1, "El SKU es requerido"),
  name: z.string().trim().min(1, "El nombre es requerido"),
  description: z.string().trim(),
  earningMode: z.enum(["percent", "fee"]),
  earningPercent: numberField("Debe ser mayor o igual a 0"),
  earningFeeAmount: numberField("Debe ser mayor o igual a 0"),
  stock: numberField("El stock debe ser mayor o igual a 0").int(
    "Debe ser un número entero",
  ),
  min_stock: numberField("El stock mínimo debe ser mayor o igual a 0").int(
    "Debe ser un número entero",
  ),
  status: z.enum(["active", "inactive"]),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const toFormValues = (product?: Product): ProductFormValues => ({
  sku: product?.sku ?? "",
  name: product?.name ?? "",
  description: product?.description ?? "",
  earningMode: product?.earning_mode ?? "percent",
  earningPercent: Number(product?.earning_percent ?? 0),
  earningFeeAmount: Number(product?.earning_fee_amount ?? 0),
  stock: product?.stock ?? 0,
  min_stock: product?.min_stock ?? 0,
  status: product?.status ?? "active",
});

interface ProductFormProps {
  product?: Product;
  onSubmit: (payload: ProductPayload) => Promise<unknown>;
}

export const ProductForm = ({ product, onSubmit }: ProductFormProps) => {
  const isEditing = !!product;
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(product),
  });

  const earningMode = useWatch({ control, name: "earningMode" });

  const submit = handleSubmit(async (values) => {
    try {
      // The form values already match the API contract.
      await onSubmit(values);
    } catch (error) {
      setError("root", { message: getErrorMessage(error) });
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="SKU *" htmlFor="sku" error={errors.sku?.message}>
          <Input
            id="sku"
            placeholder="Ej. PRD-001"
            aria-invalid={!!errors.sku}
            {...register("sku")}
          />
        </FormField>
        <FormField label="Estado" htmlFor="status">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField
        label="Nombre del Producto *"
        htmlFor="name"
        error={errors.name?.message}
      >
        <Input
          id="name"
          placeholder="Ej. Laptop Pro 15"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </FormField>

      <FormField label="Descripción" htmlFor="description">
        <Input
          id="description"
          placeholder="Breve descripción del producto"
          {...register("description")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Modo de Ganancia" htmlFor="earningMode">
          <Controller
            name="earningMode"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="earningMode" className="w-full">
                  <SelectValue placeholder="Selecciona modo de ganancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Porcentaje</SelectItem>
                  <SelectItem value="fee">Monto fijo</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {earningMode === "percent" ? (
          <FormField
            label="Ganancia (%)"
            htmlFor="earningPercent"
            error={errors.earningPercent?.message}
          >
            <Input
              id="earningPercent"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              aria-invalid={!!errors.earningPercent}
              {...register("earningPercent", { valueAsNumber: true })}
            />
          </FormField>
        ) : (
          <FormField
            label="Ganancia fija (Q)"
            htmlFor="earningFeeAmount"
            error={errors.earningFeeAmount?.message}
          >
            <Input
              id="earningFeeAmount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              aria-invalid={!!errors.earningFeeAmount}
              {...register("earningFeeAmount", { valueAsNumber: true })}
            />
          </FormField>
        )}

        <FormField
          label={isEditing ? "Stock" : "Stock Inicial"}
          htmlFor="stock"
          error={errors.stock?.message}
        >
          <Input
            id="stock"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            aria-invalid={!!errors.stock}
            {...register("stock", { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="Stock Mínimo"
          htmlFor="min_stock"
          error={errors.min_stock?.message}
        >
          <Input
            id="min_stock"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            aria-invalid={!!errors.min_stock}
            {...register("min_stock", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormErrorAlert message={errors.root?.message} />

      <div className="flex flex-col-reverse justify-end gap-4 pt-4 sm:flex-row">
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link to="/products">Cancelar</Link>
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar Cambios"
              : "Crear Producto"}
        </Button>
      </div>
    </form>
  );
};
