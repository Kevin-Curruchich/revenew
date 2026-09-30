import { useEffect, useReducer, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { calendarKeys } from "@/modules/calendar/hooks/useCalendarEvents";
import { customerKeys } from "@/modules/customers/hooks/query-keys";
import { dashboardKeys } from "@/modules/dashboard/hooks/useDashboardSummary";
import { followUpKeys } from "@/modules/follow-up/hooks/useFollowUps";
import { productKeys } from "@/modules/products/hooks/query-keys";
import { purchaseKeys } from "@/modules/purchases/hooks/query-keys";
import { saleKeys } from "@/modules/sales/hooks/query-keys";
import { getThreadState } from "../actions/threads";
import {
  AgentStreamError,
  streamAgent,
  type AgentStreamRequest,
} from "../actions/stream-agent";
import type { AnyConfirmation, Decision, ThreadState } from "../domain/agent";
import { conversationReducer, fromThreadState } from "../domain/conversation";
import { agentKeys } from "./useAgentThreads";

const MESSAGES = {
  busy: "El asistente todavía está respondiendo en esta conversación. Espera a que termine.",
  stale:
    "Esa confirmación ya no estaba pendiente (¿otra pestaña o doble clic?). Actualicé la conversación.",
  unavailable:
    "El asistente no está disponible en este momento. Intenta de nuevo en unos minutos.",
  session: "Tu sesión expiró. Vuelve a iniciar sesión.",
  connection:
    "Se perdió la conexión con el asistente. Actualicé la conversación con lo último guardado.",
  unexpected: "Ocurrió un error inesperado. Intenta de nuevo.",
};

interface UseAgentConversationOptions {
  threadId: string;
  initialState: ThreadState;
  /** The thread no longer exists (or isn't ours): 404. */
  onThreadNotFound: () => void;
}

export const useAgentConversation = ({
  threadId,
  initialState,
  onThreadNotFound,
}: UseAgentConversationOptions) => {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(
    conversationReducer,
    initialState,
    fromThreadState,
  );
  const controllerRef = useRef<AbortController | null>(null);

  // Leaving the thread cancels the run for real on the server (and stops
  // spending model tokens), so aborting on unmount is intended.
  useEffect(() => () => controllerRef.current?.abort(), []);

  /** Reload the saved conversation: the only way to get huellas back. */
  const resync = async () => {
    try {
      const saved = await getThreadState(threadId);
      queryClient.setQueryData(agentKeys.state(threadId), saved);
      dispatch({ type: "reset", state: saved });
    } catch (error) {
      if (error instanceof Error) console.error(error);
    }
  };

  /** Writes made by the agent show up in the rest of the app. */
  const refreshAppData = () => {
    for (const queryKey of [
      agentKeys.threads(), // the title is set from the first message
      saleKeys.all,
      purchaseKeys.all,
      productKeys.all,
      customerKeys.all,
      dashboardKeys.all,
      followUpKeys.all,
      calendarKeys.all,
    ]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  };

  const handleHttpError = async (error: AgentStreamError) => {
    switch (error.status) {
      case 401:
        dispatch({ type: "set-error", message: MESSAGES.session });
        return;
      case 404:
        onThreadNotFound();
        return;
      case 409:
        if (error.detail.includes("corrida en curso")) {
          // Never retry: a second request on a busy thread is the problem.
          dispatch({ type: "set-error", message: MESSAGES.busy });
          return;
        }
        // A confirmation is open, or the answered one no longer is: the
        // saved state tells which ones are pending (with their huella).
        await resync();
        dispatch({ type: "set-error", message: MESSAGES.stale });
        return;
      case 503:
        dispatch({ type: "set-error", message: MESSAGES.unavailable });
        return;
      default:
        // 422 means this panel built a bad request body.
        console.error("Agent request rejected", error.status, error.detail);
        dispatch({ type: "set-error", message: MESSAGES.unexpected });
    }
  };

  /**
   * Runs one turn. Resolves `true` once the server accepted the request,
   * `false` if it was rejected before streaming.
   */
  const runTurn = (
    body: AgentStreamRequest,
    onAccepted: () => void,
  ): Promise<boolean> =>
    new Promise((resolve) => {
      if (controllerRef.current) {
        // A turn is already in flight on this thread: never stack requests.
        resolve(false);
        return;
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      dispatch({ type: "turn-start" });

      let accepted = false;
      streamAgent(body, {
        signal: controller.signal,
        onOpen: () => {
          accepted = true;
          onAccepted();
          resolve(true);
        },
        onEvent: (event) => dispatch({ type: "agent-event", event }),
      })
        .then(async (terminal) => {
          // No terminal event (or a mid-turn error): what we have locally
          // may be incomplete, the saved state is the truth.
          if (terminal !== "fin") await resync();
        })
        .catch(async (error) => {
          if (controller.signal.aborted) return;
          if (error instanceof AgentStreamError) {
            await handleHttpError(error);
          } else {
            await resync();
            dispatch({ type: "set-error", message: MESSAGES.connection });
          }
        })
        .finally(() => {
          if (!accepted) resolve(false);
          if (controller.signal.aborted) return;
          controllerRef.current = null;
          dispatch({ type: "turn-end" });
          if (accepted) refreshAppData();
        });
    });

  const sendMessage = (text: string) =>
    runTurn({ thread_id: threadId, mensaje: text }, () =>
      dispatch({ type: "turn-open", userText: text }),
    );

  const respond = (confirmation: AnyConfirmation, decision: Decision) =>
    runTurn(
      {
        thread_id: threadId,
        interrupt_id: confirmation.interrupt_id,
        decision,
      },
      () => dispatch({ type: "turn-open", clearPending: true }),
    );

  const dismissError = () => dispatch({ type: "set-error", message: null });

  return { ...state, sendMessage, respond, dismissError };
};
