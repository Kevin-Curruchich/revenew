import { useState } from "react";
import { KeyRound } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { getErrorMessage } from "@/lib/errors";
import type { User, UserRole } from "@/modules/auth";
import { roleLabels } from "../domain/team";
import { useCreatePasswordLink, useUpdateMember } from "../hooks/useTeam";
import { sendSetupEmail, type SetupLink } from "../actions/send-setup-email";
import { SetupLinkResult } from "./SetupLinkResult";

const roles = Object.keys(roleLabels) as UserRole[];

const NewLinkDialog = ({ member }: { member: User }) => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<SetupLink | null>(null);
  const createLink = useCreatePasswordLink();
  const name = member.display_name || member.email;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setResult(null);
      createLink.reset();
    }
  };

  const handleConfirm = () =>
    createLink.mutate(member.id, {
      onSuccess: async ({ password_setup_link }) =>
        setResult(await sendSetupEmail(member.email, password_setup_link)),
    });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Nuevo enlace de contraseña para ${name}`}
          title="Nuevo enlace de contraseña"
        >
          <KeyRound />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo enlace de contraseña</DialogTitle>
          {result ? null : (
            <DialogDescription>
              Para cuando {name} no definió su contraseña a tiempo o la olvidó.
            </DialogDescription>
          )}
        </DialogHeader>
        {result ? <SetupLinkResult {...result} /> : null}
        <FormErrorAlert
          message={createLink.error ? getErrorMessage(createLink.error) : null}
        />
        <DialogFooter>
          {result ? (
            <DialogClose asChild>
              <Button>Listo</Button>
            </DialogClose>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant="outline">Volver</Button>
              </DialogClose>
              <Button disabled={createLink.isPending} onClick={handleConfirm}>
                {createLink.isPending ? "Generando..." : "Generar y enviar"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Role, access and password link for one member (never the admin's own row). */
export const MemberActions = ({ member }: { member: User }) => {
  const update = useUpdateMember();
  const name = member.display_name || member.email;
  const setActive = (is_active: boolean) =>
    update.mutate({ id: member.id, data: { is_active } });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-1">
        <Select
          value={member.role}
          disabled={update.isPending}
          onValueChange={(role) =>
            update.mutate({ id: member.id, data: { role: role as UserRole } })
          }
        >
          <SelectTrigger
            size="sm"
            className="w-36"
            aria-label={`Rol de ${name}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {roleLabels[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {member.is_active ? (
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" disabled={update.isPending}>
                Desactivar
              </Button>
            }
            title={`¿Desactivar a ${name}?`}
            description="No podrá entrar a Revenew hasta que lo vuelvas a activar."
            confirmLabel="Desactivar"
            variant="destructive"
            onConfirm={() => setActive(false)}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled={update.isPending}
            onClick={() => setActive(true)}
          >
            Activar
          </Button>
        )}
        <NewLinkDialog member={member} />
      </div>
      <FormErrorAlert
        message={update.error ? getErrorMessage(update.error) : null}
      />
    </div>
  );
};
