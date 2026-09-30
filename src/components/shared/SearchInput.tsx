import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  /** Initial value (e.g. read from the URL). */
  defaultValue?: string;
  /** Called with the trimmed value once the user stops typing. */
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

/**
 * Keeps its own state while typing and only notifies the parent after a
 * pause, so we don't fire one request per keystroke.
 */
export const SearchInput = ({
  defaultValue = "",
  onSearch,
  placeholder = "Buscar...",
  className,
  delay = 350,
}: SearchInputProps) => {
  const [value, setValue] = useState(defaultValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onSearch(nextValue.trim()), delay);
  };

  return (
    <div className={cn("relative w-full sm:max-w-sm", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </div>
  );
};
