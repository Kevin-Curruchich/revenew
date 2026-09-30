import type { ReactNode } from "react";
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

interface ConfirmDialogProps {
  /** Element that opens the dialog (usually a <Button />). */
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
}

/** Asks for confirmation before running an irreversible action. */
export const ConfirmDialog = ({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) => (
  <Dialog>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Volver</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
