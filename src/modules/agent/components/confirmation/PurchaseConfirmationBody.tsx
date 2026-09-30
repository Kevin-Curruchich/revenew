import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/shared/FormField";
import { formatCurrency } from "@/lib/formatters";
import type { PaymentMethod, PurchaseConfirmation } from "../../domain/agent";
import {
  buildPurchaseCorrection,
  type CorrectionDecision,
} from "../../domain/decisions";
import { formatQuantity, paymentMethodLabels } from "../../domain/labels";
import { ConfirmationField } from "./ConfirmationField";
import { purchaseEditSchema, type PurchaseEditValues } from "./edit-schemas";

const PurchaseSummary = ({
  confirmation,
}: {
  confirmation: PurchaseConfirmation;
}) => {
  const { preview } = confirmation;
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <ConfirmationField label="Proveedor">
          {preview.proveedor ?? "—"}
        </ConfirmationField>
        <ConfirmationField label="Fecha">{preview.fecha}</ConfirmationField>
        <ConfirmationField label="Medio de pago">
          {preview.medio_pago
            ? (paymentMethodLabels[preview.medio_pago as PaymentMethod] ??
              preview.medio_pago)
            : "—"}
        </ConfirmationField>
        {preview.referencia ? (
          <ConfirmationField label="Referencia">
            {preview.referencia}
          </ConfirmationField>
        ) : null}
      </dl>
      {preview.notas ? (
        <p className="text-sm text-muted-foreground">{preview.notas}</p>
      ) : null}

      <ul className="divide-y rounded-md border text-sm">
        {preview.items.map((item, index) => (
          <li
            key={`${item.producto_id}-${index}`}
            className="flex items-start justify-between gap-3 p-3"
          >
            <div>
              <p className="font-medium">
                {item.producto_nombre ?? "Producto desconocido"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatQuantity(item.cantidad)} ×{" "}
                {formatCurrency(item.costo_unitario)}
              </p>
              {!item.producto_existe ? (
                <Badge variant="destructive">El producto no existe</Badge>
              ) : !item.producto_activo ? (
                <Badge variant="secondary">Producto inactivo</Badge>
              ) : null}
            </div>
            <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
          </li>
        ))}
      </ul>

      <div className="flex justify-between text-sm font-semibold">
        <span>Total</span>
        <span>{formatCurrency(preview.total)}</span>
      </div>
    </div>
  );
};

interface PurchaseCorrectionFormProps {
  confirmation: PurchaseConfirmation;
  disabled: boolean;
  onSubmit: (decision: CorrectionDecision) => void;
  onCancel: () => void;
}

const PurchaseCorrectionForm = ({
  confirmation,
  disabled,
  onSubmit,
  onCancel,
}: PurchaseCorrectionFormProps) => {
  const { preview } = confirmation;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PurchaseEditValues>({
    resolver: zodResolver(purchaseEditSchema),
    defaultValues: {
      items: preview.items.map((item) => ({
        cantidad: item.cantidad,
        costo_unitario: item.costo_unitario,
      })),
    },
  });

  return (
    <form
      className="space-y-3"
      noValidate
      onSubmit={handleSubmit((values) =>
        onSubmit(buildPurchaseCorrection(preview, values.items)),
      )}
    >
      {preview.items.map((item, index) => (
        <fieldset
          key={`${item.producto_id}-${index}`}
          className="space-y-2 rounded-md border p-3"
        >
          <legend className="px-1 text-sm font-medium">
            {item.producto_nombre ?? "Producto desconocido"}
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs">
              Cantidad
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                aria-invalid={!!errors.items?.[index]?.cantidad}
                {...register(`items.${index}.cantidad`)}
              />
              <FieldError message={errors.items?.[index]?.cantidad?.message} />
            </label>
            <label className="space-y-1 text-xs">
              Costo unitario
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                aria-invalid={!!errors.items?.[index]?.costo_unitario}
                {...register(`items.${index}.costo_unitario`)}
              />
              <FieldError
                message={errors.items?.[index]?.costo_unitario?.message}
              />
            </label>
          </div>
        </fieldset>
      ))}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Descartar cambios
        </Button>
        <Button type="submit" disabled={disabled}>
          Recalcular
        </Button>
      </div>
    </form>
  );
};

export const PurchaseConfirmationBody = ({
  confirmation,
  isEditing,
  disabled,
  onSubmitCorrection,
  onCancelEdit,
}: {
  confirmation: PurchaseConfirmation;
  isEditing: boolean;
  disabled: boolean;
  onSubmitCorrection: (decision: CorrectionDecision) => void;
  onCancelEdit: () => void;
}) =>
  isEditing ? (
    <PurchaseCorrectionForm
      confirmation={confirmation}
      disabled={disabled}
      onSubmit={onSubmitCorrection}
      onCancel={onCancelEdit}
    />
  ) : (
    <PurchaseSummary confirmation={confirmation} />
  );
