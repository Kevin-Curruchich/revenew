// src/modules/agent/components/composer/extensions.ts
import { Extension, Node, type Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { NodeSelection, PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";

import { commandLabels } from "../../domain/labels";
import type { MentionFilter, MentionOption } from "../../domain/mention-options";
import { COMMANDS, type Comando } from "../../domain/mentions";
import { findCustomerMention, findSlotPos } from "./doc-helpers";
import type { MenuController, MenuItem } from "./menu-controller";
import { NODE, type SlotTipo } from "./schema";
import { buildTemplate } from "./templates";

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

/** Selects the slot to jump to; `false` when there is none. */
export const selectSlot = (
  editor: Editor,
  from: number,
  direction: "next" | "prev" | "first",
): boolean => {
  const pos = findSlotPos(editor.state.doc, from, direction);
  if (pos === null) return false;
  editor.chain().focus().setNodeSelection(pos).scrollIntoView().run();
  return true;
};

interface ComposerKeysOptions {
  onSubmit: () => void;
}

/** Enter sends, Shift+Enter breaks the line, Tab walks the slots. */
export const ComposerKeys = Extension.create<ComposerKeysOptions>({
  name: "composerKeys",
  addOptions() {
    return { onSubmit: () => {} };
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        this.options.onSubmit();
        return true;
      },
      "Shift-Enter": ({ editor }) => editor.commands.setHardBreak(),
      Tab: ({ editor }) => {
        const { selection } = editor.state;
        const from = selection instanceof NodeSelection ? selection.from : selection.from - 1;
        return selectSlot(editor, from, "next");
      },
      "Shift-Tab": ({ editor }) => selectSlot(editor, editor.state.selection.from, "prev"),
    };
  },
});

interface ComposerSuggestionsOptions {
  menu: MenuController | null;
  search: (filter: MentionFilter, query: string) => Promise<MentionOption[]>;
}

interface ComposerSuggestionsStorage {
  /** Set while a picker slot is being answered: narrows the `@` list. */
  slotFilter: MentionFilter | null;
  /** The slot the `@` replaced, to put it back if nothing is chosen. */
  slotOrigin: SlotTipo | null;
}

const MENTION_TITLES: Record<MentionFilter["kind"], string> = {
  any: "Mencionar",
  cliente: "Clientes",
  producto: "Productos",
  venta: "Ventas pendientes",
};

/**
 * `@` and `/` lists. They run before the keyboard shortcuts (higher
 * priority), so Enter picks an option while a list is open.
 */
export const ComposerSuggestions = Extension.create<ComposerSuggestionsOptions, ComposerSuggestionsStorage>({
  name: "composerSuggestions",
  priority: 200,
  addOptions() {
    return { menu: null, search: async () => [] };
  },
  addStorage() {
    return { slotFilter: null, slotOrigin: null };
  },
  addProseMirrorPlugins() {
    const { menu, search } = this.options;
    const storage = this.storage;
    const editor = this.editor;

    const render = (title: () => string) => () => ({
      onStart: (props: { items: MenuItem[]; command: (item: MenuItem) => void }) =>
        menu?.open(title(), props.items, props.command),
      onUpdate: (props: { items: MenuItem[]; command: (item: MenuItem) => void }) =>
        menu?.open(title(), props.items, props.command),
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        // Let Shift+Tab / Shift+Enter through to the keyboard shortcuts.
        if (event.shiftKey && (event.key === "Tab" || event.key === "Enter")) return false;
        return menu?.handleKey(event.key) ?? false;
      },
      onExit: () => menu?.close(),
    });

    const currentFilter = (): MentionFilter => {
      const filter = storage.slotFilter ?? { kind: "any" };
      return filter.kind === "venta" ? { kind: "venta", customerId: findCustomerMention(editor.state.doc) } : filter;
    };

    const mentionItems = async ({ query }: { query: string }): Promise<MenuItem[]> => {
      const filter = currentFilter();
      if (filter.kind === "venta" && !filter.customerId) {
        return [{ kind: "notice", text: "Elige primero el cliente" }];
      }
      try {
        const options = await search(filter, query);
        return options.length
          ? options.map((option) => ({ kind: "mention", option }))
          : [{ kind: "notice", text: "Sin resultados" }];
      } catch {
        return [{ kind: "notice", text: "No se pudo buscar" }];
      }
    };

    return [
      Suggestion<MenuItem, MenuItem>({
        editor,
        pluginKey: new PluginKey("mentionSuggestion"),
        char: "@",
        items: mentionItems,
        command: ({ editor, range, props }) => {
          if (props.kind !== "mention") return;
          const { tipo, id, nombre } = props.option;
          const fromSlot = storage.slotOrigin !== null;
          storage.slotFilter = null;
          storage.slotOrigin = null;
          editor
            .chain()
            .focus()
            .insertContentAt(range, [{ type: NODE.mention, attrs: { tipo, id, nombre } }, { type: "text", text: " " }])
            .run();
          if (fromSlot) selectSlot(editor, range.from, "next");
        },
        render: render(() => MENTION_TITLES[currentFilter().kind]),
      }),
      Suggestion<MenuItem, MenuItem>({
        editor,
        pluginKey: new PluginKey("commandSuggestion"),
        char: "/",
        startOfLine: true,
        // Only on an otherwise empty message.
        allow: ({ state, range }) =>
          state.doc.childCount === 1 &&
          state.doc.textContent === state.doc.textBetween(range.from, range.to) &&
          findSlotPos(state.doc, 0, "first") === null,
        items: ({ query }) => {
          const matches = COMMANDS.filter((comando) => comando.startsWith(query.toLowerCase()));
          return matches.length
            ? matches.map((comando) => ({ kind: "command", comando }))
            : [{ kind: "notice", text: "Sin comandos" }];
        },
        command: ({ editor, range, props }) => {
          if (props.kind !== "command") return;
          editor.chain().focus().insertContentAt(range, buildTemplate(props.comando)).run();
          selectSlot(editor, 0, "first");
        },
        render: render(() => "Comandos"),
      }),
    ];
  },
});
