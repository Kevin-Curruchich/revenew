import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SetupLink } from "../actions/send-setup-email";

/** Shows the setup link so the admin can also send it by WhatsApp. */
export const SetupLinkResult = ({ email, link, emailSent }: SetupLink) => {
  const [copied, setCopied] = useState(false);

  // Clipboard can be blocked; the link stays selectable in the input.
  const copy = () =>
    navigator.clipboard.writeText(link).then(
      () => setCopied(true),
      () => undefined,
    );

  return (
    <div className="space-y-3 text-sm">
      <p>
        {emailSent
          ? `Enviamos un correo a ${email} para que defina su contraseña.`
          : `No se pudo enviar el correo a ${email}. Compártele el enlace.`}{" "}
        También puedes copiar el enlace y mandarlo por WhatsApp. Caduca en 1
        hora.
      </p>
      <div className="flex gap-2">
        <Input
          readOnly
          value={link}
          aria-label="Enlace para definir contraseña"
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button type="button" variant="outline" onClick={copy}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
};
