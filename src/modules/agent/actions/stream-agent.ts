import { signOut } from "firebase/auth";

import { API_BASE_URL } from "@/api/revenewApi";
import { auth } from "@/lib/firebase";
import type { AgentEvent, Decision } from "../domain/agent";
import { createSseParser, toAgentEvent } from "../domain/sse-parser";

const STREAM_URL = `${API_BASE_URL}/api/v1/agent/stream`;

export type AgentStreamRequest =
  | { thread_id: string; mensaje: string }
  // `interrupt_id` is a SIBLING of `decision`, never nested inside it.
  | { thread_id: string; interrupt_id: string; decision: Decision };

/** The server answered with an HTTP error before the stream started. */
export class AgentStreamError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail || `HTTP ${status}`);
    this.name = "AgentStreamError";
    this.status = status;
    this.detail = detail;
  }
}

interface StreamAgentOptions {
  signal: AbortSignal;
  /** The server accepted the request (200) and the stream is starting. */
  onOpen?: () => void;
  onEvent: (event: AgentEvent) => void;
}

const readDetail = async (response: Response): Promise<string> => {
  try {
    const body = await response.json();
    return typeof body?.detail === "string" ? body.detail : "";
  } catch {
    return "";
  }
};

const post = async (
  body: AgentStreamRequest,
  signal: AbortSignal,
  forceTokenRefresh: boolean,
) => {
  const token = await auth.currentUser?.getIdToken(forceTokenRefresh);
  return fetch(STREAM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });
};

/**
 * Runs one agent turn over `POST /agent/stream` and dispatches its SSE events.
 *
 * Uses `fetch` + a stream reader because `EventSource` can't POST nor send
 * the `Authorization` header. Aborting `signal` is the right way to stop:
 * the backend cancels the run for real when the client disconnects.
 *
 * Resolves with the terminal event (`fin`/`error`) or `null` if the body
 * ended without one (connection lost). HTTP errors are sent before the
 * first byte, so they reject with {@link AgentStreamError}.
 */
export const streamAgent = async (
  body: AgentStreamRequest,
  { signal, onOpen, onEvent }: StreamAgentOptions,
): Promise<"fin" | "error" | null> => {
  let response = await post(body, signal, false);

  // An expired token: refresh it once and retry.
  if (response.status === 401) {
    response = await post(body, signal, true);
    if (response.status === 401) {
      await signOut(auth);
    }
  }

  if (!response.ok || !response.body) {
    throw new AgentStreamError(response.status, await readDetail(response));
  }

  onOpen?.();

  let terminal: "fin" | "error" | null = null;
  const parser = createSseParser((raw) => {
    const event = toAgentEvent(raw);
    if (!event) return;
    if (event.event === "fin" || event.event === "error") {
      terminal = event.event;
    }
    onEvent(event);
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.push(decoder.decode(value, { stream: true }));
    }
    parser.push(decoder.decode());
    parser.flush();
  } finally {
    reader.releaseLock();
  }

  return terminal;
};
