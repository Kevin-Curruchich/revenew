import { describe, expect, it } from "vitest";
import type { JSONContent } from "@tiptap/core";
import { needsSpaceAfter } from "./doc-helpers";
import { serializeMessage } from "./serialize";
import { buildTemplate } from "./templates";

const doc = (...content: JSONContent[]): JSONContent => ({
  type: "doc",
  content: [{ type: "paragraph", content }],
});
const text = (value: string): JSONContent => ({ type: "text", text: value });
const mention = (tipo: string, id: string | null, nombre: string): JSONContent => ({
  type: "mention",
  attrs: { tipo, id, nombre },
});
const slot = (tipo: string): JSONContent => ({ type: "slot", attrs: { tipo, placeholder: tipo } });
const chip = (comando: string): JSONContent => ({ type: "commandChip", attrs: { comando } });

/**
 * Fills a template the way the editor leaves it: a typed or chosen value
 * replaces the slot, a chosen mention gets a space only when nothing
 * separates it from what follows (see the mention command).
 */
const fillTemplate = (comando: "venta", values: Record<string, JSONContent>): JSONContent => {
  const template = buildTemplate(comando);
  const content = template.flatMap((node, index) => {
    const value = node.type === "slot" ? values[node.attrs?.tipo] : node;
    if (!value) return [node];
    if (value.type !== "mention") return [value];
    const next = template[index + 1];
    const nextText = !next ? "" : next.type === "text" ? (next.text ?? "") : "\uFFFC";
    return needsSpaceAfter(nextText) ? [value, text(" ")] : [value];
  });
  return doc(...content);
};

describe("serializeMessage", () => {
  it("serializes a filled /venta template without double spaces", () => {
    const result = serializeMessage(
      fillTemplate("venta", {
        cantidad: text("2"),
        producto: mention("producto", "p1", "Cartón de huevos"),
        cliente: mention("cliente", "c1", "Aurita"),
        pagado: text("no pagado"),
      }),
    );
    expect(result.mensaje).toBe("Vendí 2 @Cartón de huevos a @Aurita, no pagado");
    expect(result.menciones?.map((m) => [m.inicio, m.fin])).toEqual([[8, 25], [28, 35]]);
  });

  it("builds text, command and code-point ranges", () => {
    const result = serializeMessage(
      doc(chip("venta"), text(" Vendí 2 "), mention("producto", "p1", "Cartón de huevos"),
        text(" a "), mention("cliente", "c1", "Aurita"), text(", no pagado")),
    );
    expect(result).toEqual({
      mensaje: "Vendí 2 @Cartón de huevos a @Aurita, no pagado",
      comando: "venta",
      menciones: [
        { tipo: "producto", id: "p1", nombre: "Cartón de huevos", inicio: 8, fin: 25 },
        { tipo: "cliente", id: "c1", nombre: "Aurita", inicio: 28, fin: 35 },
      ],
    });
  });

  it("drops empty slots, extra spaces and dangling separators", () => {
    const result = serializeMessage(
      doc(chip("venta"), text(" Vendí "), slot("cantidad"), text(" "), mention("producto", "p1", "Cartón"),
        text(" a "), mention("cliente", "c1", "Aurita"), text(", "), slot("pagado")),
    );
    expect(result.mensaje).toBe("Vendí @Cartón a @Aurita");
    expect(result.menciones?.map((m) => [m.inicio, m.fin])).toEqual([[6, 13], [16, 23]]);
  });

  it("supports several product rows", () => {
    const result = serializeMessage(
      doc(chip("venta"), text(" Vendí 2 "), mention("producto", "p1", "Cartón"), text(", 1 "),
        mention("producto", "p2", "Media docena"), text(" a "), mention("cliente", "c1", "Aurita")),
    );
    expect(result.mensaje).toBe("Vendí 2 @Cartón, 1 @Media docena a @Aurita");
    expect(result.menciones).toHaveLength(3);
  });

  it("counts an emoji before a mention as one code point", () => {
    const result = serializeMessage(doc(text("🥚 "), mention("cliente", "c1", "Aurita")));
    expect(result.menciones?.[0]).toMatchObject({ inicio: 2, fin: 9 });
  });

  it("leaves out comando and menciones when there are none", () => {
    expect(serializeMessage(doc(text("¿cuánto hay en caja?")))).toEqual({
      mensaje: "¿cuánto hay en caja?",
    });
  });

  it("keeps line breaks", () => {
    expect(serializeMessage(doc(text("uno"), { type: "hardBreak" }, text("dos"))).mensaje).toBe("uno\ndos");
  });

  it("sends a mention without id (pasted HTML) as plain text", () => {
    const result = serializeMessage(doc(text("a "), mention("cliente", null, "Aurita")));
    expect(result).toEqual({ mensaje: "a @Aurita" });
  });

  it("returns an empty message for a template with nothing filled", () => {
    expect(serializeMessage(doc(chip("caja"), text(" "), slot("tipo_caja"), text(" de "), slot("monto")))).toMatchObject({
      mensaje: "de",
    });
  });
});
