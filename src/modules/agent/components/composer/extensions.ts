// src/modules/agent/components/composer/extensions.ts
import { Node } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

import { commandLabels } from "../../domain/labels";
import type { Comando } from "../../domain/mentions";
import { NODE } from "./schema";

/** A customer, product or sale. Atomic: Backspace removes it whole. */
export const MentionNode = Node.create({
  name: NODE.mention,
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      tipo: { default: null, parseHTML: (el) => el.getAttribute("data-mention") },
      id: { default: null, parseHTML: (el) => el.getAttribute("data-id") },
      nombre: { default: "", parseHTML: (el) => el.getAttribute("data-nombre") ?? "" },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-mention]" }];
  },
  renderHTML({ node }) {
    return [
      "span",
      {
        "data-mention": node.attrs.tipo,
        "data-id": node.attrs.id,
        "data-nombre": node.attrs.nombre,
        class: "rounded bg-primary/10 px-1 font-medium text-primary",
      },
      `@${node.attrs.nombre}`,
    ];
  },
  renderText({ node }) {
    return `@${node.attrs.nombre}`;
  },
});

/** The command of the message, always its first node. */
export const CommandChipNode = Node.create({
  name: NODE.commandChip,
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addAttributes() {
    return { comando: { default: null } };
  },
  renderHTML({ node }) {
    const label = commandLabels[node.attrs.comando as Comando]?.label ?? node.attrs.comando;
    return [
      "span",
      { "data-command": node.attrs.comando, class: "rounded bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground" },
      label,
    ];
  },
  renderText() {
    return "";
  },
});

/** An empty template slot. Filling it replaces the node. */
export const SlotNode = Node.create({
  name: NODE.slot,
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return { tipo: { default: null }, placeholder: { default: "" } };
  },
  renderHTML({ node }) {
    return [
      "span",
      {
        "data-slot-tipo": node.attrs.tipo,
        class:
          "rounded border border-dashed border-muted-foreground/50 px-1 text-muted-foreground [&.ProseMirror-selectednode]:border-primary [&.ProseMirror-selectednode]:ring-2 [&.ProseMirror-selectednode]:ring-primary/30",
      },
      node.attrs.placeholder,
    ];
  },
  renderText() {
    return "";
  },
});

/** Nodes of the composer document. Mentions, chips and slots only. */
export const composerNodes = [Document, Paragraph, Text, HardBreak, MentionNode, CommandChipNode, SlotNode];
