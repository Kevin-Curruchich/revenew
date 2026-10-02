import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
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
import type { PaymentConfirmation } from "../../domain/agent";
import {
  buildPaymentCorrection,
  type CorrectionDecision,
} from "../../domain/decisions";
import { paymentMethodLabels } from "../../domain/labels";
import { ConfirmationField } from "./ConfirmationField";
import { paymentEditSchema, type PaymentEditValues } from "./edit-schemas";

const PaymentSummary = ({
  confirmation,
}: {
  confirmation: PaymentConfirmation;
}) => {
  const { cobro } = confirmation;
  return (
    <dl className="grid grid-cols-2 gap-2 text-sm">
      <ConfirmationField label="Cliente">{cobro.cliente}</ConfirmationField>
      <ConfirmationField label="Total">
        {formatCurrency(cobro.total)}
      </ConfirmationField>
      <ConfirmationField label="Fecha de la venta">
        {cobro.fecha_venta}
      </ConfirmationField>
      <ConfirmationField label="Venta">
        #{cobro.venta_id.slice(0, 8)}
      </ConfirmationField>
      <ConfirmationField label="Fecha de pago">
        {cobro.fecha_pago}
      </ConfirmationField>
      <ConfirmationField label="Medio de pago">
        {paymentMethodLabels[cobro.medio_pago] ?? cobro.medio_pago}
      </ConfirmationField>
    </dl>
  );
};

interface PaymentCorrectionFormProps {
  confirmation: PaymentConfirmation;
  disabled: boolean;
  onSubmit: (decision: CorrectionDecision) => void;
  onCancel: () => void;
}

const PaymentCorrectionForm = ({
  confirmation,
  disabled,
  onSubmit,
  onCancel,
}: PaymentCorrectionFormProps) => {
  const { cobro } = confirmation;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PaymentEditValues>({
    resolver: zodResolver(paymentEditSchema),
    defaultValues: {
      fecha_pago: cobro.fecha_pago,
      medio_pago: cobro.medio_pago,
    },
  });

  const submit = handleSubmit((values) => {
    const decision = buildPaymentCorrection(cobro, values);
    if (decision) onSubmit(decision);
    else setError("root", { message: "No cambiaste ningún dato." });
  });

  return (
    <form className="space-y-3" noValidate onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-xs">
          Fecha de pago
          <Controller
            control={control}
            name="fecha_pago"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                aria-label="Fecha de pago"
                aria-invalid={!!errors.fecha_pago}
                className="sm:w-full"
              />
            )}
          />
          <FieldError message={errors.fecha_pago?.message} />
        </label>
        <div className="space-y-1 text-xs">
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
                </SelectContent>
              </Select>
            )}
          />
        </div>
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

export const PaymentConfirmationBody = ({
  confirmation,
  isEditing,
  disabled,
  onSubmitCorrection,
  onCancelEdit,
}: {
  confirmation: PaymentConfirmation;
  isEditing: boolean;
  disabled: boolean;
  onSubmitCorrection: (decision: CorrectionDecision) => void;
  onCancelEdit: () => void;
}) =>
  isEditing ? (
    <PaymentCorrectionForm
      confirmation={confirmation}
      disabled={disabled}
      onSubmit={onSubmitCorrection}
      onCancel={onCancelEdit}
    />
  ) : (
    <PaymentSummary confirmation={confirmation} />
  );
