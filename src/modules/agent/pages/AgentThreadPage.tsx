import { Link, useNavigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/QueryStates";
import { AgentConversation } from "../components/AgentConversation";
import {
  agentKeys,
  useAgentThreads,
  useThreadState,
} from "../hooks/useAgentThreads";

export const AgentThreadPage = () => {
  const { threadId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const stateQuery = useThreadState(threadId);
  const { data: threads } = useAgentThreads();
  const title = threads?.find((thread) => thread.id === threadId)?.title;

  const goToThreadList = () => {
    void queryClient.invalidateQueries({ queryKey: agentKeys.threads() });
    navigate("/agent", { replace: true });
  };

  const header = (
    <div className="flex items-center gap-2 border-b px-4 py-3">
      <Button variant="ghost" size="icon-sm" className="md:hidden" asChild>
        <Link to="/agent" aria-label="Volver a las conversaciones">
          <ArrowLeft />
        </Link>
      </Button>
      <h1 className="line-clamp-1 font-semibold">{title ?? "Conversación"}</h1>
    </div>
  );

  let content;
  if (stateQuery.isPending) {
    content = <LoadingState label="Cargando conversación..." />;
  } else if (stateQuery.isError) {
    const status = isAxiosError(stateQuery.error)
      ? stateQuery.error.response?.status
      : undefined;
    content =
      status === 404 ? (
        <EmptyState
          title="Conversación no encontrada"
          description="Puede que se haya borrado. Elige otra o empieza una nueva."
        />
      ) : (
        <ErrorState
          error={stateQuery.error}
          title={
            status === 503
              ? "El asistente no está disponible en este momento"
              : "No se pudo cargar la conversación"
          }
          onRetry={() => stateQuery.refetch()}
        />
      );
  } else {
    content = (
      // Remount per thread: each conversation owns its stream and state.
      <AgentConversation
        key={threadId}
        threadId={threadId}
        initialState={stateQuery.data}
        onThreadNotFound={goToThreadList}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {header}
      <div className="min-h-0 flex-1">{content}</div>
    </div>
  );
};
