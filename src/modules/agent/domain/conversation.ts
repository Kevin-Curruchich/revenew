import type { AgentEvent, AnyConfirmation, ThreadState } from "./agent";

export type ChatItem =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "assistant"; text: string; streaming: boolean }
  | { id: string; kind: "tool"; name: string };

/**
 * An open confirmation as announced. `key` is local and changes with every
 * announcement: after `corregir` the server re-announces the SAME
 * `interrupt_id` with new figures, and the card must start fresh.
 */
export interface PendingConfirmation {
  key: string;
  confirmation: AnyConfirmation;
}

export interface ConversationState {
  items: ChatItem[];
  /** Open confirmations, each answerable with its own `interrupt_id`. */
  pending: PendingConfirmation[];
  isStreaming: boolean;
  /** Tool currently running, to show "consultando…" instead of silence. */
  activeTool: string | null;
  error: string | null;
}

export type ConversationAction =
  | { type: "reset"; state: ThreadState }
  | { type: "turn-start" }
  /** The server accepted the request: the stream is open. */
  | { type: "turn-open"; userText?: string; clearPending?: boolean }
  | { type: "agent-event"; event: AgentEvent }
  | { type: "turn-end" }
  | { type: "set-error"; message: string | null };

let nextId = 0;
const newId = () => `local-${++nextId}`;

export const fromThreadState = (state: ThreadState): ConversationState => ({
  items: state.mensajes.map((message, index): ChatItem => {
    const id = `saved-${index}`;
    if (message.rol === "usuario")
      return { id, kind: "user", text: message.texto };
    if (message.rol === "asistente")
      return { id, kind: "assistant", text: message.texto, streaming: false };
    return { id, kind: "tool", name: message.nombre };
  }),
  pending: state.confirmaciones_pendientes.map((confirmation) => ({
    key: newId(),
    confirmation,
  })),
  isStreaming: false,
  activeTool: null,
  error: null,
});

const stopStreamingText = (items: ChatItem[]) =>
  items.map((item) =>
    item.kind === "assistant" && item.streaming
      ? { ...item, streaming: false }
      : item,
  );

const applyEvent = (
  state: ConversationState,
  event: AgentEvent,
): ConversationState => {
  switch (event.event) {
    case "token": {
      const last = state.items.at(-1);
      const items =
        last?.kind === "assistant" && last.streaming
          ? [
              ...state.items.slice(0, -1),
              { ...last, text: last.text + event.data.texto },
            ]
          : [
              ...state.items,
              {
                id: newId(),
                kind: "assistant" as const,
                text: event.data.texto,
                streaming: true,
              },
            ];
      return { ...state, items, activeTool: null };
    }
    case "herramienta":
      return {
        ...state,
        items: [
          ...stopStreamingText(state.items),
          { id: newId(), kind: "tool", name: event.data.nombre },
        ],
        activeTool: event.data.nombre,
      };
    case "confirmacion":
      // A re-announced confirmation replaces the old copy (same id, but its
      // data — and huella — must be read from the newest event).
      return {
        ...state,
        pending: [
          ...state.pending.filter(
            (item) =>
              item.confirmation.interrupt_id !== event.data.interrupt_id,
          ),
          { key: newId(), confirmation: event.data },
        ],
        activeTool: null,
      };
    case "fin":
      return { ...state, activeTool: null };
    case "error":
      return { ...state, activeTool: null, error: event.data.mensaje };
  }
};

export const conversationReducer = (
  state: ConversationState,
  action: ConversationAction,
): ConversationState => {
  switch (action.type) {
    case "reset":
      return { ...fromThreadState(action.state), error: state.error };
    case "turn-start":
      return { ...state, isStreaming: true, error: null };
    case "turn-open":
      return {
        ...state,
        items: action.userText
          ? [
              ...state.items,
              { id: newId(), kind: "user", text: action.userText },
            ]
          : state.items,
        // Answering one confirmation re-announces the others in this same
        // stream, so the local copies are dropped instead of cached.
        pending: action.clearPending ? [] : state.pending,
      };
    case "agent-event":
      return applyEvent(state, action.event);
    case "turn-end":
      return {
        ...state,
        items: stopStreamingText(state.items),
        isStreaming: false,
        activeTool: null,
      };
    case "set-error":
      return { ...state, error: action.message };
  }
};
