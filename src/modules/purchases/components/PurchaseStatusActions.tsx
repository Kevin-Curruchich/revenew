import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { getErrorMessage } from "@/lib/errors";
import {
  useCancelPurchase,
  useConfirmPurchase,
  useDeletePurchase,
} from "../hooks/usePurchase";

interface PurchaseStatusActionsProps {
  purchaseId: string;
  /** Unsaved form changes: confirming would ignore them. */
  hasUnsavedChanges: boolean;
  onDone: () => void;
}

/** Confirm / cancel / delete actions for a draft purchase. */
export const PurchaseStatusActions = ({
  purchaseId,
  hasUnsavedChanges,
  onDone,
}: PurchaseStatusActionsProps) => {
  const confirmPurchase = useConfirmPurchase();
  const cancelPurchase = useCancelPurchase();
  const deletePurchase = useDeletePurchase();

  const isBusy =
    confirmPurchase.isPending ||
    cancelPurchase.isPending ||
    deletePurchase.isPending;
  const error =
    confirmPurchase.error ?? cancelPurchase.error ?? deletePurchase.error;

  return (
    <div className="space-y-4 border-t pt-4">
      <ConfirmDialog
        trigger={
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isBusy || hasUnsavedChanges}
          >
            {confirmPurchase.isPending ? "Confirmando..." : "Confirmar Compra"}
          </Button>
        }
        title="¿Confirmar compra?"
        description="El stock de los productos se incrementará y la compra ya no podrá editarse."
        confirmLabel="Confirmar"
        onConfirm={() =>
          confirmPurchase.mutate(purchaseId, { onSuccess: onDone })
        }
      />
      {hasUnsavedChanges ? (
        <p className="text-xs text-muted-foreground">
          Guarda los cambios antes de confirmar la compra.
        </p>
      ) : null}

      <ConfirmDialog
        trigger={
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isBusy}
          >
            {cancelPurchase.isPending ? "Cancelando..." : "Cancelar Compra"}
          </Button>
        }
        title="¿Cancelar compra?"
        description="La compra quedará marcada como cancelada y no afectará el inventario."
        confirmLabel="Cancelar compra"
        variant="destructive"
        onConfirm={() =>
          cancelPurchase.mutate(purchaseId, { onSuccess: onDone })
        }
      />

      <ConfirmDialog
        trigger={
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={isBusy}
          >
            {deletePurchase.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        }
        title="¿Eliminar compra?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() =>
          deletePurchase.mutate(purchaseId, { onSuccess: onDone })
        }
      />

      <FormErrorAlert message={error ? getErrorMessage(error) : null} />
    </div>
  );
};
