import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/shared/Combobox";
import { FormField } from "@/components/shared/FormField";
import { formatCurrency } from "@/lib/formatters";
import {
  getItemSubtotal,
  type PurchaseFormValues,
} from "./purchase-form-schema";

export interface PurchaseProductOption {
  id: string;
  name: string;
  sku: string;
  stock?: string;
}

interface PurchaseItemRowProps {
  index: number;
  fieldId: string;
  products: PurchaseProductOption[];
  readOnly: boolean;
  canRemove: boolean;
  onRemove: () => void;
}

export const PurchaseItemRow = ({
  index,
  fieldId,
  products,
  readOnly,
  canRemove,
  onRemove,
}: PurchaseItemRowProps) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<PurchaseFormValues>();
  const item = useWatch({ control, name: `items.${index}` });
  const itemErrors = errors.items?.[index];

  const selectedProduct = products.find(
    (product) => product.id === item?.productId,
  );

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">Item {index + 1}</p>
          {selectedProduct ? (
            <p className="text-sm text-muted-foreground">
              SKU: {selectedProduct.sku}
              {selectedProduct.stock !== undefined
                ? ` · Stock actual: ${Number(selectedProduct.stock)}`
                : null}
            </p>
          ) : null}
        </div>
        {!readOnly && canRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Quitar
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField
          label="Producto *"
          htmlFor={`${fieldId}-product`}
          error={itemErrors?.productId?.message}
          className="md:col-span-3"
        >
          <Controller
            control={control}
            name={`items.${index}.productId`}
            render={({ field }) => (
              <Combobox
                id={`${fieldId}-product`}
                value={field.value}
                onValueChange={field.onChange}
                disabled={readOnly}
                aria-invalid={!!itemErrors?.productId}
                placeholder="Selecciona un producto"
                searchPlaceholder="Buscar producto..."
                options={products.map((product) => ({
                  value: product.id,
                  label: `${product.name} (${product.sku})`,
                }))}
              />
            )}
          />
        </FormField>

        <FormField
          label="Cantidad *"
          htmlFor={`${fieldId}-quantity`}
          error={itemErrors?.quantity?.message}
        >
          <Input
            id={`${fieldId}-quantity`}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            disabled={readOnly}
            aria-invalid={!!itemErrors?.quantity}
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Costo Unitario *"
          htmlFor={`${fieldId}-unitCost`}
          error={itemErrors?.unitCost?.message}
        >
          <Input
            id={`${fieldId}-unitCost`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            disabled={readOnly}
            aria-invalid={!!itemErrors?.unitCost}
            {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Subtotal">
          <Input
            value={formatCurrency(getItemSubtotal(item ?? {}))}
            readOnly
            disabled
          />
        </FormField>
      </div>
    </div>
  );
};
