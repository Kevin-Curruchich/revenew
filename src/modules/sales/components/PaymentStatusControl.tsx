import { useState } from "react";

import { Button } from "@/components/ui/button";
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
import type { Sale } from "../domain/sale";
import { useUpdateSalePaymentStatus } from "../hooks/useSale";

type PaymentStatusValue = "pending" | "paid";

/**
 * Lets the user pick a payment status and save it. Render it with
 * `key={sale.is_payment_pending}` so the draft resets when the saved value
 * changes (instead of syncing state in an effect).
 */
export const PaymentStatusControl = ({ sale }: { sale: Sale }) => {
  const savedValue: PaymentStatusValue = sale.is_payment_pending
    ? "pending"
    : "paid";
  const [draft, setDraft] = useState<PaymentStatusValue>(savedValue);
  const updatePaymentStatus = useUpdateSalePaymentStatus();

  const handleSave = () =>
    updatePaymentStatus.mutate({
      id: sale.id,
      isPaymentPending: draft === "pending",
    });

  return (
    <div className="space-y-3 border-t pt-4">
      <FormField label="Estado del pago" htmlFor="paymentStatus">
        <Select
          value={draft}
          onValueChange={(value) => setDraft(value as PaymentStatusValue)}
        >
          <SelectTrigger id="paymentStatus" className="w-full">
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={updatePaymentStatus.isPending || draft === savedValue}
        onClick={handleSave}
      >
        {updatePaymentStatus.isPending
          ? "Actualizando..."
          : "Actualizar estado del pago"}
      </Button>
      <FormErrorAlert
        message={
          updatePaymentStatus.error
            ? getErrorMessage(updatePaymentStatus.error)
            : null
        }
      />
    </div>
  );
};
