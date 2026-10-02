// src/modules/agent/components/ChatComposer.tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import { EditorContent } from "@tiptap/react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { OutgoingMessage } from "../domain/mentions";
import { ComposerMenu } from "./composer/ComposerMenu";
import { serializeMessage } from "./composer/serialize";
import { useComposerEditor } from "./composer/useComposerEditor";

interface ChatComposerProps {
  onSend: (message: OutgoingMessage) => Promise<boolean>;
  /** Why the input is blocked, or `null` when the person can write. */
  disabledReason: string | null;
}

export const ChatComposer = ({ onSend, disabledReason }: ChatComposerProps) => {
  const [isSending, setIsSending] = useState(false);
  const [hasText, setHasText] = useState(false);
  const isDisabled = disabledReason !== null || isSending;
  const submitRef = useRef<() => void>(() => {});

  const { editor, menu } = useComposerEditor({
    onSubmit: () => submitRef.current(),
    onChange: (current) => setHasText(serializeMessage(current.getJSON()).mensaje !== ""),
  });

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!editor || isDisabled) return;
    const message = serializeMessage(editor.getJSON());
    if (!message.mensaje) return;

    setIsSending(true);
    // Clear only once the server accepted it, so a rejected message isn't lost.
    const accepted = await onSend(message);
    if (accepted) editor.commands.clearContent(true);
    setIsSending(false);
  };

  useEffect(() => {
    submitRef.current = () => void submit();
  });

  useEffect(() => {
    editor?.setEditable(disabledReason === null);
  }, [editor, disabledReason]);

  return (
    <form onSubmit={submit} className="space-y-2">
      {disabledReason ? <p className="text-xs text-muted-foreground">{disabledReason}</p> : null}
      <div className="relative flex items-end gap-2">
        <ComposerMenu menu={menu} />
        <EditorContent editor={editor} className="min-w-0 flex-1" />
        <Button type="submit" size="icon" disabled={isDisabled || !hasText} aria-label="Enviar mensaje">
          <SendHorizontal />
        </Button>
      </div>
    </form>
  );
};
