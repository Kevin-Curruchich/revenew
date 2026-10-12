import { useState } from "react";
import { BellOff, CalendarClock } from "lucide-react";

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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { FormField } from "@/components/shared/FormField";
import { getErrorMessage } from "@/lib/errors";
import { tomorrowISODate } from "@/lib/dates";
import {
  useDismissFollowUp,
  usePostponeFollowUp,
} from "../hooks/useFollowUpActions";

interface FollowUpItemActionsProps {
  followUpId: string;
  productName: string;
}

const PostponeDialog = ({
  followUpId,
  productName,
}: FollowUpItemActionsProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const postpone = usePostponeFollowUp();
  const minDate = tomorrowISODate();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setDate("");
      postpone.reset();
    }
  };

  const handleConfirm = () =>
    postpone.mutate(
      { followUpId, date },
      { onSuccess: () => handleOpenChange(false) },
    );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Posponer seguimiento de ${productName}`}
          title="Posponer"
        >
          <CalendarClock />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Posponer seguimiento</DialogTitle>
          <DialogDescription>
            Elige cuándo volver a contactar al cliente por {productName}.
          </DialogDescription>
        </DialogHeader>
        <FormField label="Nueva fecha" htmlFor={`postpone-${followUpId}`}>
          <DatePicker
            id={`postpone-${followUpId}`}
            value={date}
            onChange={setDate}
            min={minDate}
          />
        </FormField>
        <FormErrorAlert
          message={postpone.error ? getErrorMessage(postpone.error) : null}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button
            disabled={!date || postpone.isPending}
            onClick={handleConfirm}
          >
            {postpone.isPending ? "Posponiendo..." : "Posponer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Postpone / dismiss buttons for one open follow-up (customer + product). */
export const FollowUpItemActions = ({
  followUpId,
  productName,
}: FollowUpItemActionsProps) => {
  const dismiss = useDismissFollowUp();

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <PostponeDialog followUpId={followUpId} productName={productName} />
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={dismiss.isPending}
              aria-label={`Descartar seguimiento de ${productName}`}
              title="Descartar"
            >
              <BellOff />
            </Button>
          }
          title="¿Descartar seguimiento?"
          description="No volverá a aparecer hasta la próxima venta de este producto."
          confirmLabel="Descartar"
          variant="destructive"
          onConfirm={() => dismiss.mutate(followUpId)}
        />
      </div>
      <FormErrorAlert
        message={dismiss.error ? getErrorMessage(dismiss.error) : null}
      />
    </div>
  );
};
