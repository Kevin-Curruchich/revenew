import { useId, useState, type KeyboardEvent } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { filterOptions, type ComboboxOption } from "@/lib/filter-options";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
}

/** A select you can type into to filter its options. */
export const Combobox = ({
  value,
  onValueChange,
  options,
  placeholder = "Selecciona una opción",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados",
  id,
  disabled,
  className,
  ...aria
}: ComboboxProps) => {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const visible = filterOptions(options, query);
  const selected = options.find((option) => option.value === value);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
  };

  const choose = (option: ComboboxOption | undefined) => {
    if (!option || option.disabled) return;
    onValueChange(option.value);
    handleOpenChange(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (step) {
      event.preventDefault();
      setActive((i) => (i + step + visible.length) % Math.max(visible.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(visible[active]);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          {...aria}
          className={cn(
            "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className={cn("line-clamp-1", !selected && "text-muted-foreground")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-56 p-0"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <SearchIcon className="size-4 shrink-0 opacity-50" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            aria-controls={listId}
            aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul id={listId} role="listbox" className="max-h-72 overflow-y-auto p-1">
          {visible.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </li>
          ) : (
            visible.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                ref={(node) => {
                  if (index === active) node?.scrollIntoView({ block: "nearest" });
                }}
                onMouseMove={() => setActive(index)}
                onClick={() => choose(option)}
                className={cn(
                  "relative flex cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
                  index === active && "bg-accent text-accent-foreground",
                  option.disabled && "pointer-events-none opacity-50",
                )}
              >
                {option.label}
                {option.value === value ? (
                  <CheckIcon className="absolute right-2 size-4" />
                ) : null}
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
