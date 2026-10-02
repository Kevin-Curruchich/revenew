// src/modules/agent/components/composer/menu-controller.ts
import type { MentionOption } from "../../domain/mention-options";
import type { Comando } from "../../domain/mentions";

export type MenuItem =
  | { kind: "command"; comando: Comando }
  | { kind: "mention"; option: MentionOption }
  | { kind: "choice"; value: string }
  /** Not selectable: "Sin resultados", "No se pudo buscar", … */
  | { kind: "notice"; text: string };

export interface MenuSnapshot {
  title: string;
  items: MenuItem[];
  selected: number;
  choose: (item: MenuItem) => void;
}

const isSelectable = (item: MenuItem) => item.kind !== "notice";

/**
 * State of the suggestion list, outside React so Tiptap's key handlers
 * can drive it synchronously. React reads it with `useSyncExternalStore`.
 */
export class MenuController {
  private snapshot: MenuSnapshot | null = null;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  private set(snapshot: MenuSnapshot | null) {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }

  open(title: string, items: MenuItem[], choose: (item: MenuItem) => void) {
    this.set({ title, items, choose, selected: items.findIndex(isSelectable) });
  }

  close() {
    if (this.snapshot) this.set(null);
  }

  chooseAt(index: number) {
    const item = this.snapshot?.items[index];
    if (!this.snapshot || !item || !isSelectable(item)) return;
    this.snapshot.choose(item);
  }

  private move(delta: number) {
    if (!this.snapshot) return;
    const { items, selected } = this.snapshot;
    for (let step = 1; step <= items.length; step++) {
      const index = (((selected + delta * step) % items.length) + items.length) % items.length;
      if (isSelectable(items[index])) {
        this.set({ ...this.snapshot, selected: index });
        return;
      }
    }
  }

  /** Returns `true` when the key was used by the list. */
  handleKey(key: string): boolean {
    if (!this.snapshot) return false;
    switch (key) {
      case "ArrowDown":
        this.move(1);
        return true;
      case "ArrowUp":
        this.move(-1);
        return true;
      case "Enter":
      case "Tab":
        this.chooseAt(this.snapshot.selected);
        return true;
      case "Escape":
        this.close();
        return true;
      default:
        return false;
    }
  }
}
