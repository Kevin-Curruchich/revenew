import { useState, type FormEvent } from "react";

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
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { FormField } from "@/components/shared/FormField";
import { getErrorMessage } from "@/lib/errors";
import { roleLabels, type NewMemberRole } from "../domain/team";
import { useCreateMember } from "../hooks/useTeam";
import { sendSetupEmail, type SetupLink } from "../actions/send-setup-email";
import { SetupLinkResult } from "./SetupLinkResult";

const newMemberRoles: NewMemberRole[] = ["sales_rep", "viewer"];

export const AddMemberDialog = () => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<NewMemberRole>("sales_rep");
  const [result, setResult] = useState<SetupLink | null>(null);
  const create = useCreateMember();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setRole("sales_rep");
      setResult(null);
      create.reset();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    create.mutate(
      {
        email: String(formData.get("email") ?? "").trim(),
        display_name: String(formData.get("display_name") ?? "").trim() || null,
        role,
      },
      {
        onSuccess: async (member) =>
          setResult(
            await sendSetupEmail(member.email, member.password_setup_link),
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>+ Agregar miembro</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {result ? "Miembro agregado" : "Agregar miembro"}
          </DialogTitle>
          {result ? null : (
            <DialogDescription>
              Le llegará un correo para definir su contraseña.
            </DialogDescription>
          )}
        </DialogHeader>

        {result ? (
          <>
            <SetupLinkResult {...result} />
            <DialogFooter>
              <DialogClose asChild>
                <Button>Listo</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="Email" htmlFor="member-email">
              <Input
                id="member-email"
                name="email"
                type="email"
                autoComplete="off"
                required
              />
            </FormField>
            <FormField label="Nombre (opcional)" htmlFor="member-name">
              <Input id="member-name" name="display_name" autoComplete="off" />
            </FormField>
            <FormField label="Rol" htmlFor="member-role">
              <Select
                value={role}
                onValueChange={(value) => setRole(value as NewMemberRole)}
              >
                <SelectTrigger id="member-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {newMemberRoles.map((value) => (
                    <SelectItem key={value} value={value}>
                      {roleLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormErrorAlert
              message={create.error ? getErrorMessage(create.error) : null}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Volver
                </Button>
              </DialogClose>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Agregando..." : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
