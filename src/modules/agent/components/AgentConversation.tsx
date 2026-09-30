import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import type { ThreadState } from "../domain/agent";
import { useAgentConversation } from "../hooks/useAgentConversation";
import { AgentActivity, ChatMessages } from "./ChatMessages";
import { ChatComposer } from "./ChatComposer";
import { ConfirmationCard } from "./confirmation/ConfirmationCard";

interface AgentConversationProps {
  threadId: string;
  initialState: ThreadState;
  onThreadNotFound: () => void;
}

export const AgentConversation = ({
  threadId,
  initialState,
  onThreadNotFound,
}: AgentConversationProps) => {
  const {
    items,
    pending,
    isStreaming,
    activeTool,
    error,
    sendMessage,
    respond,
    dismissError,
  } = useAgentConversation({ threadId, initialState, onThreadNotFound });

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastItem = items.at(-1);
  const scrollKey = `${items.length}-${lastItem && "text" in lastItem ? lastItem.text.length : 0}-${pending.length}-${isStreaming}`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [scrollKey]);

  // While a confirmation is open the thread only accepts its answer: a new
  // message would be rejected (409). Cancelling is the way out.
  const disabledReason = isStreaming
    ? "El asistente está respondiendo…"
    : pending.length > 0
      ? "Responde la confirmación de arriba para seguir. Si quieres cambiar de tema, cancélala."
      : null;

  const isEmpty = items.length === 0 && pending.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
        aria-live="polite"
      >
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <p className="font-medium text-foreground">
              ¿Qué quieres registrar?
            </p>
            <p className="max-w-sm text-sm">
              Escribe como hablarías: «vendí dos cartones a Aurita», «¿cuánto
              hay en caja?» o «¿a quién le toca comprar esta semana?». Antes de
              guardar algo, te pido confirmación.
            </p>
          </div>
        ) : (
          <ChatMessages items={items} />
        )}

        {pending.map(({ key, confirmation }) => (
          <ConfirmationCard
            key={key}
            confirmation={confirmation}
            disabled={isStreaming}
            onRespond={(target, decision) => void respond(target, decision)}
          />
        ))}

        {isStreaming ? <AgentActivity activeTool={activeTool} /> : null}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-2 border-t p-4">
        {error ? (
          <div className="flex items-start gap-2">
            <FormErrorAlert message={error} className="flex-1" />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={dismissError}
              aria-label="Cerrar mensaje de error"
            >
              <X />
            </Button>
          </div>
        ) : null}
        <ChatComposer onSend={sendMessage} disabledReason={disabledReason} />
      </div>
    </div>
  );
};
