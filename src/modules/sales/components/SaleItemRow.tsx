import { Controller, useFormContext, useWatch } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/FormField";
import { formatCurrency } from "@/lib/formatters";
import {
  getItemSubtotal,
  shouldShowPriceReason,
  type SaleFormValues,
} from "./sale-form-schema";

export interface SaleProductOption {
  id: string;
  name: string;
  sku: string;
  /** Unknown for products that are no longer offered for sale. */
  stock?: number;
  suggestedUnitPrice?: number;
}

interface SaleItemRowProps {
  index: number;
  fieldId: string;
  products: SaleProductOption[];
  canRemove: boolean;
  onRemove: () => void;
}

export const SaleItemRow = ({
  index,
  fieldId,
  products,
  canRemove,
  onRemove,
}: SaleItemRowProps) => {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<SaleFormValues>();
  const item = useWatch({ control, name: `items.${index}` });
  const itemErrors = errors.items?.[index];

  const handleProductChange = (productId: string) => {
    const product = products.find((option) => option.id === productId);
    const options = { shouldDirty: true, shouldValidate: true };
    // A new product starts at its suggested price with no exception.
    setValue(`items.${index}.unitPrice`, product?.suggestedUnitPrice, options);
    setValue(
      `items.${index}.suggestedUnitPrice`,
      product?.suggestedUnitPrice,
      options,
    );
    setValue(`items.${index}.isPriceOverridden`, false, options);
    setValue(`items.${index}.pricingExceptionReason`, "", options);
  };

  return (
    <div className="relative flex flex-col gap-4 rounded-lg border p-4">
      {canRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          className="absolute top-2 right-2 text-destructive"
          aria-label={`Quitar item ${index + 1}`}
        >
          <X />
        </Button>
      ) : null}

      <FormField
        label="Producto"
        htmlFor={`${fieldId}-product`}
        error={itemErrors?.productId?.message}
      >
        <Controller
          name={`items.${index}.productId`}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(productId) => {
                field.onChange(productId);
                handleProductChange(productId);
              }}
            >
              <SelectTrigger
                id={`${fieldId}-product`}
                className="w-full"
                aria-invalid={!!itemErrors?.productId}
              >
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem
                    key={product.id}
                    value={product.id}
                    disabled={product.stock === 0}
                  >
                    {product.name} ({product.sku})
                    {product.stock !== undefined
                      ? ` - Stock: ${product.stock}`
                      : ""}
                    {product.stock === 0 ? " (Sin stock)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <FormField
          label="Cantidad"
          htmlFor={`${fieldId}-quantity`}
          error={itemErrors?.quantity?.message}
        >
          <Input
            id={`${fieldId}-quantity`}
            type="number"
            inputMode="decimal"
            min="0.5"
            step="0.5"
            aria-invalid={!!itemErrors?.quantity}
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Precio Unit."
          htmlFor={`${fieldId}-unitPrice`}
          error={itemErrors?.unitPrice?.message}
          hint={
            item?.suggestedUnitPrice !== undefined
              ? `Sugerido: ${formatCurrency(item.suggestedUnitPrice)}`
              : undefined
          }
        >
          <Input
            id={`${fieldId}-unitPrice`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            aria-invalid={!!itemErrors?.unitPrice}
            {...register(`items.${index}.unitPrice`, {
              setValueAs: (value) =>
                value === "" || value === null || Number.isNaN(Number(value))
                  ? undefined
                  : Number(value),
            })}
          />
        </FormField>

        <FormField label="Subtotal" className="col-span-2 md:col-span-1">
          <Input
            value={formatCurrency(getItemSubtotal(item ?? {}))}
            readOnly
            disabled
          />
        </FormField>
      </div>

      {item && shouldShowPriceReason(item) ? (
        <FormField
          label="Motivo excepción de precio"
          htmlFor={`${fieldId}-reason`}
          error={itemErrors?.pricingExceptionReason?.message}
        >
          <Input
            id={`${fieldId}-reason`}
            placeholder="Ej. descuento especial aprobado"
            aria-invalid={!!itemErrors?.pricingExceptionReason}
            {...register(`items.${index}.pricingExceptionReason`)}
          />
        </FormField>
      ) : null}
    </div>
  );
};
