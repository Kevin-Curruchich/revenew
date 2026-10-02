import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  isKnownConfirmation,
  type AnyConfirmation,
  type Decision,
} from "../../domain/agent";
import { buildApproveDecision, CANCEL_DECISION } from "../../domain/decisions";
import { confirmationTitles } from "../../domain/labels";
import { CashMovementConfirmationBody } from "./CashMovementConfirmationBody";
import { PaymentConfirmationBody } from "./PaymentConfirmationBody";
import { PurchaseConfirmationBody } from "./PurchaseConfirmationBody";
import { SaleConfirmationBody } from "./SaleConfirmationBody";

interface ConfirmationCardProps {
  /** Same shape whether it came from the live stream or from `/state`. */
  confirmation: AnyConfirmation;
  /** A turn is running: answering now would be a 409. */
  disabled: boolean;
  onRespond: (confirmation: AnyConfirmation, decision: Decision) => void;
}

export const ConfirmationCard = ({
  confirmation,
  disabled,
  onRespond,
}: ConfirmationCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const respond = (decision: Decision) => {
    if (disabled) return;
    onRespond(confirmation, decision);
  };

  const bodyProps = {
    isEditing,
    disabled,
    onSubmitCorrection: respond,
    onCancelEdit: () => setIsEditing(false),
  };

  const body = !isKnownConfirmation(confirmation) ? (
    <p className="text-sm text-muted-foreground">
      El asistente pide confirmar una operación que este panel todavía no sabe
      mostrar. Puedes cancelarla, o aprobarla si sabes de qué se trata.
    </p>
  ) : confirmation.tipo === "confirmar_venta" ? (
    <SaleConfirmationBody confirmation={confirmation} {...bodyProps} />
  ) : confirmation.tipo === "confirmar_compra" ? (
    <PurchaseConfirmationBody confirmation={confirmation} {...bodyProps} />
  ) : confirmation.tipo === "confirmar_movimiento_caja" ? (
    <CashMovementConfirmationBody confirmation={confirmation} {...bodyProps} />
  ) : (
    <PaymentConfirmationBody confirmation={confirmation} {...bodyProps} />
  );

  const title =
    (confirmation.tipo && confirmationTitles[confirmation.tipo]) ??
    "Confirmar operación";

  return (
    <Card
      role="group"
      aria-label={title}
      className="gap-4 border-primary/40 py-4 shadow-sm"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="secondary">Esperando tu confirmación</Badge>
      </CardHeader>
      <CardContent className="px-4">{body}</CardContent>
      {!isEditing ? (
        <CardFooter className="flex flex-wrap justify-end gap-2 px-4">
          <Button
            variant="outline"
            disabled={disabled}
            onClick={() => respond(CANCEL_DECISION)}
          >
            <X />
            Cancelar
          </Button>
          {isKnownConfirmation(confirmation) ? (
            <Button
              variant="outline"
              disabled={disabled}
              onClick={() => setIsEditing(true)}
            >
              <Pencil />
              Corregir
            </Button>
          ) : null}
          <Button
            disabled={disabled}
            onClick={() => respond(buildApproveDecision(confirmation))}
          >
            <Check />
            Aprobar
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
};
