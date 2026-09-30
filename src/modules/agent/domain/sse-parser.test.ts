import { describe, expect, it } from "vitest";
import { createSseParser, toAgentEvent, type RawSseEvent } from "./sse-parser";

const collect = (chunks: string[], flush = true) => {
  const events: RawSseEvent[] = [];
  const parser = createSseParser((event) => events.push(event));
  chunks.forEach((chunk) => parser.push(chunk));
  if (flush) parser.flush();
  return events;
};

describe("createSseParser", () => {
  it("parses complete events", () => {
    expect(
      collect([
        'event: token\ndata: {"texto": "Hola"}\n\nevent: fin\ndata: {"estado": "completo"}\n\n',
      ]),
    ).toEqual([
      { event: "token", data: '{"texto": "Hola"}' },
      { event: "fin", data: '{"estado": "completo"}' },
    ]);
  });

  it("keeps an event split across chunks until it is complete", () => {
    const events: RawSseEvent[] = [];
    const parser = createSseParser((event) => events.push(event));

    parser.push('event: token\ndata: {"tex');
    expect(events).toEqual([]);
    parser.push('to": "medio"}\n');
    expect(events).toEqual([]);
    parser.push("\n");
    expect(events).toEqual([{ event: "token", data: '{"texto": "medio"}' }]);
  });

  it("handles CRLF line endings, even split between chunks", () => {
    expect(
      collect(['event: fin\r\ndata: {"estado": "pausado"}\r', "\n\r\n"]),
    ).toEqual([{ event: "fin", data: '{"estado": "pausado"}' }]);
  });

  it("joins multi-line data and ignores comments", () => {
    expect(collect([": ping\n\nevent: x\ndata: a\ndata: b\n\n"])).toEqual([
      { event: "x", data: "a\nb" },
    ]);
  });

  it("emits a final block without trailing blank line on flush", () => {
    expect(collect(['event: fin\ndata: {"estado": "completo"}'])).toEqual([
      { event: "fin", data: '{"estado": "completo"}' },
    ]);
  });
});

describe("toAgentEvent", () => {
  it("parses the JSON payload of known events", () => {
    expect(
      toAgentEvent({
        event: "herramienta",
        data: '{"nombre": "buscar_cliente", "estado": "llamando"}',
      }),
    ).toEqual({
      event: "herramienta",
      data: { nombre: "buscar_cliente", estado: "llamando" },
    });
  });

  it("ignores unknown events", () => {
    expect(toAgentEvent({ event: "ping", data: "{}" })).toBeNull();
  });
});
