import type { AgentEvent } from "./agent";

export interface RawSseEvent {
  event: string;
  data: string;
}

const AGENT_EVENTS = new Set([
  "token",
  "herramienta",
  "confirmacion",
  "fin",
  "error",
]);

/** `event:`/`data:` lines of one SSE block. Unknown fields and comments are ignored. */
const parseBlock = (block: string): RawSseEvent | null => {
  let event = "message";
  const data: string[] = [];

  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const separator = line.indexOf(":");
    const field = separator === -1 ? line : line.slice(0, separator);
    let value = separator === -1 ? "" : line.slice(separator + 1);
    if (value.startsWith(" ")) value = value.slice(1);

    if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }

  return data.length > 0 ? { event, data: data.join("\n") } : null;
};

/**
 * Incremental parser for `text/event-stream` bodies read with `fetch`.
 *
 * `EventSource` can't be used: it only does GET and can't send the
 * `Authorization` header that `POST /agent/stream` requires. Chunks can cut
 * an event anywhere, so the last (possibly incomplete) block stays buffered
 * until the next chunk arrives.
 */
export const createSseParser = (onEvent: (event: RawSseEvent) => void) => {
  let buffer = "";

  const emitCompleteBlocks = () => {
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const event = parseBlock(block);
      if (event) onEvent(event);
    }
  };

  return {
    push(chunk: string) {
      // Normalize on the whole buffer so a "\r\n" split across chunks is
      // still recognized.
      buffer = (buffer + chunk).replace(/\r\n/g, "\n");
      emitCompleteBlocks();
    },
    /** Call when the body ends: a final block may lack its blank line. */
    flush() {
      const event = parseBlock(buffer);
      buffer = "";
      if (event) onEvent(event);
    },
  };
};

/** Typed agent event, or `null` for events this panel doesn't know. */
export const toAgentEvent = (raw: RawSseEvent): AgentEvent | null => {
  if (!AGENT_EVENTS.has(raw.event)) return null;
  return { event: raw.event, data: JSON.parse(raw.data) } as AgentEvent;
};
