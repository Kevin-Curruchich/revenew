import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { FormField } from "@/components/shared/FormField";
import { todayISODate } from "@/lib/dates";
import { getErrorMessage } from "@/lib/errors";
import { cashMovementTypeBadges, type CashMovementType } from "../domain/cash";
import {
  cashMovementFormSchema,
  toCashMovementPayload,
  type CashMovementFormValues,
} from "../domain/cash-movement-form";
import { useCreateCashMovement } from "../hooks/useCreateCashMovement";

const paymentMethodOptions = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "none", label: "Sin especificar" },
] as const;

const emptyValues = (): CashMovementFormValues => ({
  type: "salida",
  amount: "",
  date: todayISODate(),
  payment_method: "efectivo",
  note: "",
});

/** Records cash that moved outside a sale or a purchase. */
export const NewCashMovementDialog = () => {
  const [open, setOpen] = useState(false);
  const create = useCreateCashMovement();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CashMovementFormValues>({
    resolver: zodResolver(cashMovementFormSchema),
    defaultValues: emptyValues(),
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      reset(emptyValues());
      create.reset();
    }
  };

  const submit = handleSubmit((values) =>
    create.mutate(toCashMovementPayload(values), {
      onSuccess: () => handleOpenChange(false),
    }),
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>+ Movimiento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo movimiento de caja</DialogTitle>
          <DialogDescription>
            Gastos, aportes, retiros o saldo inicial. Las ventas y compras ya
            registran el suyo.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Tipo" htmlFor="cash-type">
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="cash-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.keys(cashMovementTypeBadges) as CashMovementType[]
                      ).map((type) => (
                        <SelectItem key={type} value={type}>
                          {cashMovementTypeBadges[type].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label="Monto"
              htmlFor="cash-amount"
              error={errors.amount?.message}
            >
              <Input
                id="cash-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                aria-invalid={!!errors.amount}
                {...register("amount")}
              />
            </FormField>
            <FormField label="Fecha" htmlFor="cash-date" error={errors.date?.message}>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    id="cash-date"
                    value={field.value}
                    onChange={field.onChange}
                    max={todayISODate()}
                    aria-invalid={!!errors.date}
                    className="w-full"
                  />
                )}
              />
            </FormField>
            <FormField label="Medio de pago" htmlFor="cash-method">
              <Controller
                control={control}
                name="payment_method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="cash-method" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
          <FormField label="Nota (opcional)" htmlFor="cash-note">
            <Textarea id="cash-note" rows={2} {...register("note")} />
          </FormField>
          <FormErrorAlert
            message={create.error ? getErrorMessage(create.error) : null}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
