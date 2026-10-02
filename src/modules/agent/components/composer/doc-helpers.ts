// src/modules/agent/components/composer/doc-helpers.ts
import type { Node as PMNode, ResolvedPos } from "@tiptap/pm/model";

import { COMMANDS, type Comando } from "../../domain/mentions";
import { NODE } from "./schema";

/** Position of the slot to jump to with Tab / Shift+Tab, or `null`. */
export const findSlotPos = (
  doc: PMNode,
  from: number,
  direction: "next" | "prev" | "first",
): number | null => {
  const positions: number[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === NODE.slot) positions.push(pos);
  });
  if (direction === "first") return positions[0] ?? null;
  if (direction === "next") return positions.find((pos) => pos > from) ?? null;
  return positions.filter((pos) => pos < from).at(-1) ?? null;
};

export const getCommand = (doc: PMNode): Comando | null => {
  const first = doc.firstChild?.firstChild;
  const comando = first?.type.name === NODE.commandChip ? first.attrs.comando : null;
  return (COMMANDS as readonly unknown[]).includes(comando) ? (comando as Comando) : null;
};

/** Id of the first customer mentioned: `/cobro` lists that customer's sales. */
export const findCustomerMention = (doc: PMNode): string | null => {
  let id: string | null = null;
  doc.descendants((node) => {
    if (id) return false;
    if (node.type.name === NODE.mention && node.attrs.tipo === "cliente") id = node.attrs.id;
  });
  return id;
};

const isProduct = (node: PMNode | null | undefined) =>
  node?.type.name === NODE.mention && node.attrs.tipo === "producto";

/**
 * When the cursor sits right after a product mention (or after the spaces
 * that follow it), returns where a new item row should start.
 */
export const productBefore = ($from: ResolvedPos): { from: number } | null => {
  const before = $from.nodeBefore;
  if (isProduct(before)) return { from: $from.pos };
  if (before?.isText && before.text?.trim() === "") {
    // Index of the text node that holds `before`.
    const index = $from.textOffset > 0 ? $from.index() : $from.index() - 1;
    if (isProduct($from.parent.maybeChild(index - 1))) {
      return { from: $from.pos - before.nodeSize };
    }
  }
  return null;
};

/**
 * Whether a chosen mention needs a trailing space, given the text that
 * follows it: not before a space or punctuation the template already has.
 */
export const needsSpaceAfter = (next: string): boolean => !/^[\s.,;:!?)]/.test(next);
