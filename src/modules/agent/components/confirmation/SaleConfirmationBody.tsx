import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/shared/FormField";
import { formatCurrency } from "@/lib/formatters";
import type { SaleConfirmation, SalePreviewItem } from "../../domain/agent";
import {
  buildSaleCorrection,
  type CorrectionDecision,
} from "../../domain/decisions";
import { formatQuantity } from "../../domain/labels";
import { ConfirmationField } from "./ConfirmationField";
import { saleEditSchema, type SaleEditValues } from "./edit-schemas";

const ItemWarnings = ({ warnings }: { warnings: string[] }) =>
  warnings.length > 0 ? (
    <ul className="mt-1 space-y-1">
      {warnings.map((warning) => (
        <li
          key={warning}
          className="flex items-start gap-1 text-xs text-destructive"
        >
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          {warning}
        </li>
      ))}
    </ul>
  ) : null;

const PriceDetail = ({ item }: { item: SalePreviewItem }) => (
  <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
    {item.is_price_overridden ? (
      <span>Sugerido {formatCurrency(item.suggested_unit_price)}</span>
    ) : null}
    {item.is_habitual_price ? (
      <Badge variant="outline">Precio habitual</Badge>
    ) : null}
    {item.pricing_exception_reason ? (
      <span>· {item.pricing_exception_reason}</span>
    ) : null}
  </div>
);

/** FIFO lots consumed by the sale, folded by default. */
const SaleLots = ({ items }: { items: SalePreviewItem[] }) => {
  const lotCount = items.reduce((sum, item) => sum + item.lotes.length, 0);
  if (lotCount === 0) return null;

  return (
    <details className="rounded-md border px-3 py-2 text-sm">
      <summary className="cursor-pointer font-medium">
        Lotes FIFO consumidos ({lotCount})
      </summary>
      <div className="mt-2 space-y-3">
        {items.map((item, index) =>
          item.lotes.length > 0 ? (
            <div key={`${item.product_id}-${index}`}>
              <p className="text-xs font-medium">{item.product_name}</p>
              <table className="mt-1 w-full text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="text-left font-normal">Lote del</th>
                    <th className="text-right font-normal">Costo unit.</th>
                    <th className="text-right font-normal">Toma</th>
                    <th className="text-right font-normal">Disponible</th>
                  </tr>
                </thead>
                <tbody>
                  {item.lotes.map((lot) => (
                    <tr key={lot.purchase_item_id}>
                      <td>{lot.purchase_date}</td>
                      <td className="text-right">
                        {formatCurrency(lot.unit_cost)}
                      </td>
                      <td className="text-right">
                        {formatQuantity(lot.quantity_taken)}
                      </td>
                      <td className="text-right">
                        {formatQuantity(lot.quantity_available)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null,
        )}
      </div>
    </details>
  );
};

const SaleSummary = ({ confirmation }: { confirmation: SaleConfirmation }) => {
  const { preview } = confirmation;
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <ConfirmationField label="Cliente">
          {preview.customer_name}
        </ConfirmationField>
        <ConfirmationField label="Fecha">{preview.date}</ConfirmationField>
      </dl>

      <ul className="divide-y rounded-md border text-sm">
        {preview.items.map((item, index) => (
          <li key={`${item.product_id}-${index}`} className="space-y-1 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatQuantity(item.requested_quantity)} ×{" "}
                  {formatCurrency(item.final_unit_price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                <p className="text-xs text-muted-foreground">
                  Ganancia {formatCurrency(item.gross_profit_total)}
                </p>
              </div>
            </div>
            <PriceDetail item={item} />
            <ItemWarnings warnings={item.warnings} />
          </li>
        ))}
      </ul>

      <dl className="grid grid-cols-3 gap-2 text-sm">
        <ConfirmationField label="Total">
          {formatCurrency(preview.totals.total_revenue)}
        </ConfirmationField>
        <ConfirmationField label="Costo">
          {formatCurrency(preview.totals.total_cost)}
        </ConfirmationField>
        <ConfirmationField label="Ganancia">
          {formatCurrency(preview.totals.total_gross_profit)}
        </ConfirmationField>
      </dl>

      <SaleLots items={preview.items} />
    </div>
  );
};

interface SaleCorrectionFormProps {
  confirmation: SaleConfirmation;
  disabled: boolean;
  onSubmit: (decision: CorrectionDecision) => void;
  onCancel: () => void;
}

const SaleCorrectionForm = ({
  confirmation,
  disabled,
  onSubmit,
  onCancel,
}: SaleCorrectionFormProps) => {
  const { preview } = confirmation;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaleEditValues>({
    resolver: zodResolver(saleEditSchema),
    defaultValues: {
      items: preview.items.map((item) => ({
        cantidad: item.requested_quantity,
        precio_unitario: item.is_price_overridden ? item.final_unit_price : "",
      })),
    },
  });

  return (
    <form
      className="space-y-3"
      noValidate
      onSubmit={handleSubmit((values) =>
        onSubmit(buildSaleCorrection(preview, values.items)),
      )}
    >
      {preview.items.map((item, index) => (
        <fieldset
          key={`${item.product_id}-${index}`}
          className="space-y-2 rounded-md border p-3"
        >
          <legend className="px-1 text-sm font-medium">
            {item.product_name}
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
              Precio unitario
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder={`Sugerido ${formatCurrency(item.suggested_unit_price)}`}
                aria-invalid={!!errors.items?.[index]?.precio_unitario}
                {...register(`items.${index}.precio_unitario`)}
              />
              <FieldError
                message={errors.items?.[index]?.precio_unitario?.message}
              />
            </label>
          </div>
        </fieldset>
      ))}
      <p className="text-xs text-muted-foreground">
        Deja el precio vacío para usar el sugerido. El agente recalcula lotes y
        totales y te muestra la venta de nuevo.
      </p>
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

export const SaleConfirmationBody = ({
  confirmation,
  isEditing,
  disabled,
  onSubmitCorrection,
  onCancelEdit,
}: {
  confirmation: SaleConfirmation;
  isEditing: boolean;
  disabled: boolean;
  onSubmitCorrection: (decision: CorrectionDecision) => void;
  onCancelEdit: () => void;
}) =>
  isEditing ? (
    <SaleCorrectionForm
      confirmation={confirmation}
      disabled={disabled}
      onSubmit={onSubmitCorrection}
      onCancel={onCancelEdit}
    />
  ) : (
    <SaleSummary confirmation={confirmation} />
  );
