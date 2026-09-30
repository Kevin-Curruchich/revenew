import { describe, expect, it } from "vitest";
import type { AgentEvent, SaleConfirmation } from "./agent";
import {
  conversationReducer,
  fromThreadState,
  type ConversationState,
} from "./conversation";

const empty = fromThreadState({ mensajes: [], confirmaciones_pendientes: [] });

const run = (state: ConversationState, events: AgentEvent[]) =>
  events.reduce(
    (current, event) =>
      conversationReducer(current, { type: "agent-event", event }),
    state,
  );

const confirmation = (id: string, huella: unknown): SaleConfirmation => ({
  tipo: "confirmar_venta",
  interrupt_id: id,
  preview: {
    customer_id: "c1",
    customer_name: "Aurita",
    date: "2026-09-30",
    items: [],
    totals: { total_revenue: "0", total_cost: "0", total_gross_profit: "0" },
  },
  huella,
});

describe("conversationReducer", () => {
  it("concatenates tokens into one assistant message", () => {
    const state = run(empty, [
      { event: "token", data: { texto: "Vendiste " } },
      { event: "token", data: { texto: "medio" } },
    ]);
    expect(state.items).toMatchObject([
      { kind: "assistant", text: "Vendiste medio", streaming: true },
    ]);
  });

  it("starts a new assistant message after a tool call", () => {
    const state = run(empty, [
      { event: "token", data: { texto: "Busco" } },
      {
        event: "herramienta",
        data: { nombre: "buscar_cliente", estado: "llamando" },
      },
      { event: "token", data: { texto: "Listo" } },
    ]);
    expect(state.items.map((item) => item.kind)).toEqual([
      "assistant",
      "tool",
      "assistant",
    ]);
    expect(state.activeTool).toBeNull();
  });

  it("tracks the running tool until the next output", () => {
    const state = run(empty, [
      {
        event: "herramienta",
        data: { nombre: "previsualizar_venta", estado: "llamando" },
      },
    ]);
    expect(state.activeTool).toBe("previsualizar_venta");
  });

  it("keeps two confirmations and replaces a re-announced one", () => {
    const first = confirmation("a", { firma: "1" });
    const second = confirmation("b", { firma: "2" });
    const renewed = confirmation("a", { firma: "3" });

    const state = run(empty, [
      { event: "confirmacion", data: first },
      { event: "confirmacion", data: second },
      { event: "confirmacion", data: renewed },
    ]);

    expect(state.pending.map((item) => item.confirmation)).toEqual([
      second,
      renewed,
    ]);
    // A re-announcement is a new card, even with the same interrupt_id.
    const keys = state.pending.map((item) => item.key);
    expect(new Set(keys).size).toBe(2);
  });

  it("gives a corrected confirmation a new key within the same batch", () => {
    const original = run(empty, [
      { event: "confirmacion", data: confirmation("a", { firma: "1" }) },
    ]);
    const corrected = run(
      conversationReducer(original, { type: "turn-open", clearPending: true }),
      [{ event: "confirmacion", data: confirmation("a", { firma: "2" }) }],
    );
    expect(corrected.pending[0].key).not.toBe(original.pending[0].key);
  });

  it("drops local confirmations when answering one", () => {
    const withPending = run(empty, [
      { event: "confirmacion", data: confirmation("a", {}) },
      { event: "confirmacion", data: confirmation("b", {}) },
    ]);
    const answering = conversationReducer(
      conversationReducer(withPending, { type: "turn-start" }),
      { type: "turn-open", clearPending: true },
    );
    expect(answering.pending).toEqual([]);
    expect(answering.isStreaming).toBe(true);
  });

  it("shows the error event message and stops streaming at the end", () => {
    const state = conversationReducer(
      run(conversationReducer(empty, { type: "turn-start" }), [
        { event: "token", data: { texto: "Un momento" } },
        { event: "error", data: { mensaje: "Hubo un problema" } },
      ]),
      { type: "turn-end" },
    );
    expect(state.error).toBe("Hubo un problema");
    expect(state.isStreaming).toBe(false);
    expect(state.items[0]).toMatchObject({ streaming: false });
  });

  it("maps the saved history", () => {
    expect(
      fromThreadState({
        mensajes: [
          { rol: "usuario", texto: "vendí dos cartones" },
          { rol: "herramienta", nombre: "previsualizar_venta" },
          { rol: "asistente", texto: "Son Q50" },
        ],
        confirmaciones_pendientes: [],
      }).items.map((item) => item.kind),
    ).toEqual(["user", "tool", "assistant"]);
  });
});
