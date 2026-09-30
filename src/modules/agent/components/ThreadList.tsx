import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormErrorAlert } from "@/components/shared/FormErrorAlert";
import { ErrorState, LoadingState } from "@/components/shared/QueryStates";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { AgentThread } from "../domain/agent";
import {
  useAgentThreads,
  useCreateThread,
  useDeleteThread,
  useRenameThread,
} from "../hooks/useAgentThreads";

const updatedAtFormatter = new Intl.DateTimeFormat("es-GT", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const RenameForm = ({
  thread,
  onDone,
}: {
  thread: AgentThread;
  onDone: () => void;
}) => {
  const [title, setTitle] = useState(thread.title);
  const renameThread = useRenameThread();

  const save = () => {
    const next = title.trim();
    if (!next || next === thread.title) return onDone();
    renameThread.mutate({ id: thread.id, title: next }, { onSuccess: onDone });
  };

  return (
    <form
      className="flex gap-1 p-1"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => event.key === "Escape" && onDone()}
        aria-label="Nuevo nombre de la conversación"
        className="h-8"
      />
      <Button type="submit" size="sm" disabled={renameThread.isPending}>
        Guardar
      </Button>
    </form>
  );
};

const ThreadRow = ({
  thread,
  onDeleted,
}: {
  thread: AgentThread;
  onDeleted: (threadId: string) => void;
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const deleteThread = useDeleteThread();

  if (isRenaming) {
    return <RenameForm thread={thread} onDone={() => setIsRenaming(false)} />;
  }

  return (
    <div className="group relative">
      <NavLink
        to={`/agent/${thread.id}`}
        className={({ isActive }) =>
          cn(
            "block rounded-md px-3 py-2 pr-16 text-sm transition-colors hover:bg-accent",
            isActive && "bg-accent font-medium",
          )
        }
      >
        <span className="line-clamp-1">{thread.title}</span>
        <span className="text-xs text-muted-foreground">
          {updatedAtFormatter.format(new Date(thread.updated_at))}
        </span>
      </NavLink>
      <div className="absolute top-1/2 right-1 flex -translate-y-1/2 opacity-100 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Renombrar «${thread.title}»`}
          onClick={() => setIsRenaming(true)}
        >
          <Pencil />
        </Button>
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Borrar «${thread.title}»`}
              disabled={deleteThread.isPending}
            >
              <Trash2 />
            </Button>
          }
          title="¿Borrar conversación?"
          description="Se borra el historial de esta conversación. Las ventas, compras y movimientos que ya se registraron no se tocan."
          confirmLabel="Borrar"
          variant="destructive"
          onConfirm={() =>
            deleteThread.mutate(thread.id, {
              onSuccess: () => onDeleted(thread.id),
            })
          }
        />
      </div>
    </div>
  );
};

export const ThreadList = ({ activeThreadId }: { activeThreadId?: string }) => {
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useAgentThreads();
  const createThread = useCreateThread();

  const startConversation = () =>
    createThread.mutate(undefined, {
      onSuccess: (thread) => navigate(`/agent/${thread.id}`),
    });

  const handleDeleted = (threadId: string) => {
    if (threadId === activeThreadId) navigate("/agent", { replace: true });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b p-3">
        <Button
          className="w-full"
          onClick={startConversation}
          disabled={createThread.isPending}
        >
          <Plus />
          Nueva conversación
        </Button>
        <FormErrorAlert
          className="mt-2"
          message={
            createThread.error ? getErrorMessage(createThread.error) : null
          }
        />
      </div>
      <nav
        aria-label="Conversaciones"
        className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2"
      >
        {isPending ? (
          <LoadingState label="Cargando conversaciones..." />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            Todavía no tienes conversaciones.
          </p>
        ) : (
          data.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </nav>
    </div>
  );
};
