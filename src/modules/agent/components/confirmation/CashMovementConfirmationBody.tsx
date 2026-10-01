import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/shared/FormField";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { formatCurrency } from "@/lib/formatters";
import type { CashMovementConfirmation } from "../../domain/agent";
import {
  buildCashMovementCorrection,
  type CorrectionDecision,
} from "../../domain/decisions";
import {
  cashMovementTypeLabels,
  paymentMethodLabels,
} from "../../domain/labels";
import { ConfirmationField } from "./ConfirmationField";
import {
  cashMovementEditSchema,
  type CashMovementEditValues,
} from "./edit-schemas";

const NO_PAYMENT_METHOD = "none";

const CashMovementSummary = ({
  confirmation,
}: {
  confirmation: CashMovementConfirmation;
}) => {
  const { movimiento } = confirmation;
  return (
    <dl className="grid grid-cols-2 gap-2 text-sm">
      <ConfirmationField label="Tipo">
        {cashMovementTypeLabels[movimiento.tipo] ?? movimiento.tipo}
      </ConfirmationField>
      <ConfirmationField label="Monto">
        {formatCurrency(movimiento.monto)}
      </ConfirmationField>
      <ConfirmationField label="Fecha">{movimiento.fecha}</ConfirmationField>
      <ConfirmationField label="Medio de pago">
        {movimiento.medio_pago
          ? paymentMethodLabels[movimiento.medio_pago]
          : "—"}
      </ConfirmationField>
      {movimiento.compra_id ? (
        <ConfirmationField label="Compra">
          #{movimiento.compra_id.slice(0, 8)}
        </ConfirmationField>
      ) : null}
      {movimiento.venta_id ? (
        <ConfirmationField label="Venta">
          #{movimiento.venta_id.slice(0, 8)}
        </ConfirmationField>
      ) : null}
      {movimiento.nota ? (
        <div className="col-span-2">
          <ConfirmationField label="Nota">{movimiento.nota}</ConfirmationField>
        </div>
      ) : null}
    </dl>
  );
};

interface CashMovementCorrectionFormProps {
  confirmation: CashMovementConfirmation;
  disabled: boolean;
  onSubmit: (decision: CorrectionDecision) => void;
  onCancel: () => void;
}

const CashMovementCorrectionForm = ({
  confirmation,
  disabled,
  onSubmit,
  onCancel,
}: CashMovementCorrectionFormProps) => {
  const { movimiento } = confirmation;
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CashMovementEditValues>({
    resolver: zodResolver(cashMovementEditSchema),
    defaultValues: {
      monto: movimiento.monto,
      fecha: movimiento.fecha,
      medio_pago: movimiento.medio_pago ?? NO_PAYMENT_METHOD,
      nota: movimiento.nota ?? "",
    },
  });

  const submit = handleSubmit((values) => {
    const decision = buildCashMovementCorrection(movimiento, {
      monto: values.monto,
      fecha: values.fecha,
      medio_pago:
        values.medio_pago === NO_PAYMENT_METHOD ? null : values.medio_pago,
      nota: values.nota.trim() || null,
    });
    if (decision) onSubmit(decision);
    else setError("root", { message: "No cambiaste ningún dato." });
  });

  return (
    <form className="space-y-3" noValidate onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-xs">
          Monto
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            aria-invalid={!!errors.monto}
            {...register("monto")}
          />
          <FieldError message={errors.monto?.message} />
        </label>
        <label className="space-y-1 text-xs">
          Fecha
          <Controller
            control={control}
            name="fecha"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                aria-label="Fecha"
                aria-invalid={!!errors.fecha}
                className="sm:w-full"
              />
            )}
          />
          <FieldError message={errors.fecha?.message} />
        </label>
        <div className="col-span-2 space-y-1 text-xs">
          <span>Medio de pago</span>
          <Controller
            control={control}
            name="medio_pago"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-label="Medio de pago">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value={NO_PAYMENT_METHOD}>
                    Sin especificar
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <label className="col-span-2 space-y-1 text-xs">
          Nota
          <Input {...register("nota")} />
        </label>
      </div>
      <FormErrorAlert message={errors.root?.message} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Descartar cambios
        </Button>
        <Button type="submit" disabled={disabled}>
          Enviar corrección
        </Button>
      </div>
    </form>
  );
};

export const CashMovementConfirmationBody = ({
  confirmation,
  isEditing,
  disabled,
  onSubmitCorrection,
  onCancelEdit,
}: {
  confirmation: CashMovementConfirmation;
  isEditing: boolean;
  disabled: boolean;
  onSubmitCorrection: (decision: CorrectionDecision) => void;
  onCancelEdit: () => void;
}) =>
  isEditing ? (
    <CashMovementCorrectionForm
      confirmation={confirmation}
      disabled={disabled}
      onSubmit={onSubmitCorrection}
      onCancel={onCancelEdit}
    />
  ) : (
    <CashMovementSummary confirmation={confirmation} />
  );
