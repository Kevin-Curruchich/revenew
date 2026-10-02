// src/modules/agent/components/composer/useComposerEditor.ts
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEditor, type Editor } from "@tiptap/react";
import { Placeholder, UndoRedo } from "@tiptap/extensions";

import { debounceLatest } from "@/lib/debounce";
import { searchMentions } from "../../actions/search-mentions";
import type { MentionFilter } from "../../domain/mention-options";
import { composerNodes, ComposerKeys, ComposerSuggestions, SlotBehavior } from "./extensions";
import { MenuController } from "./menu-controller";

// ProseMirror sets contenteditable="false" while the editor is not editable
// (ChatComposer ties that to `disabledReason`): that is the disabled look.
const EDITOR_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 max-h-40 min-h-10 w-full overflow-y-auto rounded-md border bg-transparent px-3 py-2 text-base whitespace-pre-wrap break-words shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] [&[contenteditable=false]]:cursor-not-allowed [&[contenteditable=false]]:opacity-50 md:text-sm";

interface UseComposerEditorOptions {
  /** Called on Enter (outside a list). Read through a ref by the caller. */
  onSubmit: () => void;
  onChange: (editor: Editor) => void;
}

export const useComposerEditor = ({ onSubmit, onChange }: UseComposerEditorOptions) => {
  const queryClient = useQueryClient();
  const [menu] = useState(() => new MenuController());
  const [search] = useState(() =>
    debounceLatest((filter: MentionFilter, query: string) => searchMentions(queryClient, filter, query), 200),
  );

  const editor = useEditor({
    extensions: [
      ...composerNodes,
      UndoRedo,
      Placeholder.configure({ placeholder: "Ej. vendí dos cartones a Aurita · / comandos · @ mencionar" }),
      ComposerKeys.configure({ onSubmit }),
      ComposerSuggestions.configure({ menu, search }),
      SlotBehavior.configure({ menu }),
    ],
    editorProps: {
      attributes: {
        class: EDITOR_CLASS,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Mensaje para el asistente",
      },
    },
    onUpdate: ({ editor }) => onChange(editor),
  });

  return { editor, menu };
};
