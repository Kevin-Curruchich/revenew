// src/modules/agent/components/composer/ComposerMenu.tsx
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { commandLabels } from "../../domain/labels";
import type { MentionTipo } from "../../domain/mentions";
import type { MenuController, MenuItem } from "./menu-controller";

const groupLabels: Record<MentionTipo, string> = {
  cliente: "Clientes",
  producto: "Productos",
  venta: "Ventas pendientes",
};

const itemKey = (item: MenuItem, index: number) =>
  item.kind === "mention" ? `${item.option.tipo}-${item.option.id}` : `${item.kind}-${index}`;

/** The open list, anchored above the composer (not to the caret). */
export const ComposerMenu = ({ menu }: { menu: MenuController }) => {
  const snapshot = useSyncExternalStore(menu.subscribe, menu.getSnapshot);
  if (!snapshot) return null;

  return (
    <div
      role="listbox"
      aria-label={snapshot.title}
      className="absolute right-0 bottom-full left-0 z-10 mb-2 max-h-64 overflow-y-auto rounded-md border bg-popover p-1 text-sm text-popover-foreground shadow-md"
    >
      {snapshot.items.map((item, index) => {
        const previous = snapshot.items[index - 1];
        const header =
          item.kind === "mention" && (previous?.kind !== "mention" || previous.option.tipo !== item.option.tipo)
            ? groupLabels[item.option.tipo]
            : null;
        return (
          <div key={itemKey(item, index)}>
            {header ? <p className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">{header}</p> : null}
            {item.kind === "notice" ? (
              <p className="px-2 py-1.5 text-muted-foreground">{item.text}</p>
            ) : (
              <button
                type="button"
                role="option"
                aria-selected={index === snapshot.selected}
                // Keep the editor focused: choose on mousedown.
                onMouseDown={(event) => {
                  event.preventDefault();
                  menu.chooseAt(index);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left",
                  index === snapshot.selected && "bg-accent text-accent-foreground",
                )}
              >
                {item.kind === "command" ? (
                  <>
                    <span className="font-medium">/{item.comando}</span>
                    <span className="text-xs text-muted-foreground">{commandLabels[item.comando].description}</span>
                  </>
                ) : item.kind === "mention" ? (
                  <>
                    <span className={cn(item.option.sinStock && "text-muted-foreground")}>{item.option.nombre}</span>
                    {item.option.detalle ? (
                      <span className={cn("text-xs", item.option.sinStock ? "text-destructive" : "text-muted-foreground")}>
                        {item.option.detalle}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span>{item.value}</span>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
