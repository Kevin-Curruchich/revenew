// src/modules/agent/components/composer/doc-helpers.test.ts
import { describe, expect, it } from "vitest";
import { getSchema, type JSONContent } from "@tiptap/core";
import { composerNodes } from "./extensions";
import { findCustomerMention, findSlotPos, getCommand, needsSpaceAfter, productBefore } from "./doc-helpers";
import { buildTemplate } from "./templates";

const schema = getSchema(composerNodes);
const toDoc = (content: JSONContent[]) =>
  schema.nodeFromJSON({ type: "doc", content: [{ type: "paragraph", content }] });
const slotPositions = (doc: ReturnType<typeof toDoc>) => {
  const positions: number[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === "slot") positions.push(pos);
  });
  return positions;
};

describe("findSlotPos", () => {
  const doc = toDoc(buildTemplate("venta"));
  const [first, second, , last] = slotPositions(doc);

  it("finds the first, next and previous slot", () => {
    expect(findSlotPos(doc, 0, "first")).toBe(first);
    expect(findSlotPos(doc, first, "next")).toBe(second);
    expect(findSlotPos(doc, second, "prev")).toBe(first);
  });

  it("returns null past the last slot (Tab leaves the editor)", () => {
    expect(findSlotPos(doc, last, "next")).toBeNull();
    expect(findSlotPos(doc, first, "prev")).toBeNull();
  });
});

describe("getCommand / findCustomerMention", () => {
  it("reads the command chip and the first customer", () => {
    const doc = toDoc([
      ...buildTemplate("cobro").slice(0, 2),
      { type: "mention", attrs: { tipo: "cliente", id: "c1", nombre: "Aurita" } },
    ]);
    expect(getCommand(doc)).toBe("cobro");
    expect(findCustomerMention(doc)).toBe("c1");
  });

  it("returns null without them", () => {
    const doc = toDoc([{ type: "text", text: "hola" }]);
    expect(getCommand(doc)).toBeNull();
    expect(findCustomerMention(doc)).toBeNull();
  });
});

describe("productBefore", () => {
  const product = { type: "mention", attrs: { tipo: "producto", id: "p1", nombre: "Cartón" } };

  it("detects a product right before the cursor", () => {
    const doc = toDoc([{ type: "text", text: "2 " }, product]);
    expect(productBefore(doc.resolve(doc.content.size - 1))).toEqual({ from: doc.content.size - 1 });
  });

  it("skips the space inserted after the mention", () => {
    const doc = toDoc([{ type: "text", text: "2 " }, product, { type: "text", text: "  a " }]);
    // Cursor right after the first space following the mention.
    const mentionEnd = 1 + 2 + 1;
    expect(productBefore(doc.resolve(mentionEnd + 1))).toEqual({ from: mentionEnd });
  });

  it("ignores customers and plain text", () => {
    const doc = toDoc([{ type: "mention", attrs: { tipo: "cliente", id: "c1", nombre: "A" } }, { type: "text", text: "x" }]);
    expect(productBefore(doc.resolve(doc.content.size - 1))).toBeNull();
  });
});

describe("needsSpaceAfter", () => {
  it("adds a space at the end of the line or before a word or a chip", () => {
    expect(needsSpaceAfter("")).toBe(true);
    expect(needsSpaceAfter("hola")).toBe(true);
    expect(needsSpaceAfter("\uFFFC")).toBe(true);
  });

  it("skips it before a space or punctuation the template already has", () => {
    expect(needsSpaceAfter(" a ")).toBe(false);
    expect(needsSpaceAfter(", ")).toBe(false);
    expect(needsSpaceAfter(".")).toBe(false);
    expect(needsSpaceAfter("\n")).toBe(false);
  });
});
