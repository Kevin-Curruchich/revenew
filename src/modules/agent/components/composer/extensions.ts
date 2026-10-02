// src/modules/agent/components/composer/extensions.ts
import { Extension, Node, type Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import Suggestion from "@tiptap/suggestion";

import { commandLabels } from "../../domain/labels";
import type { MentionFilter, MentionOption } from "../../domain/mention-options";
import { COMMANDS, type Comando } from "../../domain/mentions";
import { findCustomerMention, findSlotPos, getCommand, productBefore } from "./doc-helpers";
import type { MenuController, MenuItem } from "./menu-controller";
import { NODE, PICKER_SLOTS, SLOT_CHOICES, SLOT_PLACEHOLDERS, type SlotTipo } from "./schema";
import { buildTemplate, itemRow } from "./templates";

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
      onKeyDown: ({ view, event, range }: { view: EditorView; event: KeyboardEvent; range: { from: number; to: number } }) => {
        // Let Shift+Tab / Shift+Enter through to the keyboard shortcuts.
        if (event.shiftKey && (event.key === "Tab" || event.key === "Enter")) return false;
        // Tab on a slot's untouched "@" skips the slot (onExit puts it back).
        if (event.key === "Tab" && storage.slotOrigin && view.state.doc.textBetween(range.from, range.to) === "@") {
          return false;
        }
        return menu?.handleKey(event.key) ?? false;
      },
      onExit: (props: { range: { from: number; to: number }; editor: Editor }) => {
        menu?.close();
        const origin = storage.slotOrigin;
        storage.slotFilter = null;
        storage.slotOrigin = null;
        // Nothing chosen and only "@" left: put the slot back.
        if (origin && props.editor.state.doc.textBetween(props.range.from, props.range.to) === "@") {
          props.editor
            .chain()
            .insertContentAt(
              props.range,
              { type: NODE.slot, attrs: { tipo: origin, placeholder: SLOT_PLACEHOLDERS[origin] } },
              // Keep wherever the user moved to (Shift+Tab, a tap on another slot).
              { updateSelection: false },
            )
            .run();
        }
      },
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

interface SlotBehaviorOptions {
  menu: MenuController | null;
}

interface SlotBehaviorStorage {
  /** True while the open list is a choice list opened by this extension. */
  choiceOpen: boolean;
  /** Position of the choice slot that opened the list. */
  choicePos: number | null;
}

/**
 * What a selected slot does: picker slots turn into a narrowed `@` list,
 * choice slots show their options, free slots are replaced by typing
 * (ProseMirror's default for a selected node). Also adds item rows.
 */
export const SlotBehavior = Extension.create<SlotBehaviorOptions, SlotBehaviorStorage>({
  name: "slotBehavior",
  // Above ComposerKeys (Enter sends), below ComposerSuggestions.
  priority: 150,
  addOptions() {
    return { menu: null };
  },
  addStorage() {
    return { choiceOpen: false, choicePos: null };
  },
  onSelectionUpdate() {
    const { editor, storage } = this;
    const { menu } = this.options;
    const { selection } = editor.state;
    const suggestions = (editor.storage as unknown as { composerSuggestions: ComposerSuggestionsStorage }).composerSuggestions;
    const node = selection instanceof NodeSelection ? selection.node : null;
    const tipo = node?.type.name === NODE.slot ? (node.attrs.tipo as SlotTipo) : null;

    // Leaving the slot that opened a choice list closes it, before anything
    // else runs (a picker slot opens its own list). Never close one we didn't open.
    if (storage.choiceOpen && !(tipo && selection.from === storage.choicePos)) {
      storage.choiceOpen = false;
      storage.choicePos = null;
      menu?.close();
    }

    if (!tipo) return;

    const picker = PICKER_SLOTS[tipo];
    if (picker) {
      suggestions.slotFilter = picker === "venta" ? { kind: "venta", customerId: null } : { kind: picker };
      suggestions.slotOrigin = tipo;
      // Typing "@" in place of the slot opens the narrowed list.
      editor.chain().insertContentAt({ from: selection.from, to: selection.to }, "@").run();
      return;
    }

    const choices = SLOT_CHOICES[tipo];
    if (choices) {
      const pos = selection.from;
      storage.choiceOpen = true;
      storage.choicePos = pos;
      menu?.open(
        SLOT_PLACEHOLDERS[tipo],
        choices.map((value) => ({ kind: "choice", value })),
        (item) => {
          if (item.kind !== "choice") return;
          storage.choiceOpen = false;
          storage.choicePos = null;
          menu.close();
          editor.chain().focus().insertContentAt({ from: pos, to: pos + 1 }, item.value).run();
          selectSlot(editor, pos, "next");
        },
      );
    }
  },
  addProseMirrorPlugins() {
    const { menu } = this.options;
    const editor = this.editor;
    const storage = this.storage;
    return [
      new Plugin({
        props: {
          // The choice list is not a Suggestion: route its keys here.
          handleKeyDown: (_view, event) => {
            const selection = editor.state.selection;
            const onChoiceSlot =
              selection instanceof NodeSelection &&
              selection.node.type.name === NODE.slot &&
              SLOT_CHOICES[selection.node.attrs.tipo as SlotTipo] !== undefined;
            if (!onChoiceSlot || event.key === "Tab") return false;
            const handled = menu?.handleKey(event.key) ?? false;
            if (handled) {
              event.preventDefault();
              if (event.key === "Escape") {
                storage.choiceOpen = false;
                storage.choicePos = null;
              }
            }
            return handled;
          },
          // ", " right after a product in /venta or /compra adds a row.
          handleTextInput: (view, from, to, text) => {
            if (text !== ",") return false;
            const comando = getCommand(view.state.doc);
            if (comando !== "venta" && comando !== "compra") return false;
            const target = productBefore(view.state.doc.resolve(from));
            if (!target || from !== to) return false;
            editor.chain().focus().insertContentAt({ from: target.from, to }, itemRow()).run();
            selectSlot(editor, target.from, "next");
            return true;
          },
        },
      }),
    ];
  },
});
