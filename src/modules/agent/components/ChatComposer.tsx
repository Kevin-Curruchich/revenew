import { useState, type FormEvent, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatComposerProps {
  onSend: (text: string) => Promise<boolean>;
  /** Why the input is blocked, or `null` when the person can write. */
  disabledReason: string | null;
}

export const ChatComposer = ({ onSend, disabledReason }: ChatComposerProps) => {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const isDisabled = disabledReason !== null || isSending;

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = text.trim();
    if (!message || isDisabled) return;

    setIsSending(true);
    // Clear only once the server accepted it, so a rejected message isn't lost.
    const accepted = await onSend(message);
    if (accepted) setText("");
    setIsSending(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      {disabledReason ? (
        <p className="text-xs text-muted-foreground">{disabledReason}</p>
      ) : null}
      <div className="flex items-end gap-2">
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej. vendí dos cartones a Aurita"
          aria-label="Mensaje para el asistente"
          disabled={disabledReason !== null}
          rows={1}
          className="max-h-40 min-h-10 resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isDisabled || !text.trim()}
          aria-label="Enviar mensaje"
        >
          <SendHorizontal />
        </Button>
      </div>
    </form>
  );
};
