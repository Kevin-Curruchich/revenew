import { ChevronDown, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/modules/auth/domain/user";
import { getUserInitials } from "@/modules/auth/helpers/get-user-initials";

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

/** Header pill with the user's avatar; the logout action lives inside it. */
export const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const name = user.display_name || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full border border-border bg-background/60 py-1 pr-3 pl-1 text-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={`Menú de ${name}`}
      >
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        >
          {getUserInitials(user)}
        </span>
        <span className="max-w-40 truncate font-medium">{name}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* The auth guard redirects to /login once the session ends. */}
        <DropdownMenuItem variant="destructive" onSelect={onLogout}>
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
