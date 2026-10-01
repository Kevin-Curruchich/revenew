import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/modules/auth";
import { UserMenu } from "./UserMenu";

const SIDEBAR_COLLAPSED_KEY = "revenew.sidebar-collapsed";

// Storage can be unavailable (private mode, blocked site data); the sidebar
// then just starts expanded and forgets the choice.
const readSidebarCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

const useSidebarCollapsed = () => {
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);
  const toggle = () =>
    setCollapsed((previous) => {
      const next = !previous;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Not persisted; the toggle still works for this session.
      }
      return next;
    });
  return { collapsed, toggle };
};

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/agent", label: "Asistente", icon: "🤖" },
  { path: "/products", label: "Productos", icon: "📦" },
  { path: "/purchases", label: "Compras", icon: "🛒" },
  { path: "/customers", label: "Clientes", icon: "👥" },
  { path: "/sales", label: "Ventas", icon: "💰" },
  { path: "/cash", label: "Caja", icon: "💵" },
  { path: "/profit", label: "Ganancias", icon: "📈" },
  { path: "/follow-up", label: "Seguimiento", icon: "📋" },
  { path: "/calendar", label: "Calendario", icon: "📅" },
];

interface NavLinksProps {
  onNavigate?: () => void;
  className?: string;
  itemClassName?: string;
  /** Icons only; the label stays available to screen readers and as a tooltip. */
  collapsed?: boolean;
}

const NavLinks = ({
  onNavigate,
  className,
  itemClassName,
  collapsed = false,
}: NavLinksProps) => (
  <nav
    className={cn("flex flex-col gap-2 p-4", collapsed && "px-2", className)}
  >
    {navItems.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            buttonVariants({ variant: isActive ? "default" : "ghost" }),
            "w-full",
            collapsed ? "justify-center px-0" : "justify-start",
            itemClassName,
          )
        }
      >
        <span aria-hidden="true">{item.icon}</span>
        <span className={cn(collapsed && "sr-only")}>{item.label}</span>
      </NavLink>
    ))}
  </nav>
);

export const AppLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebar = useSidebarCollapsed();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 h-(--header-height) border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/85">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <Link to="/dashboard">
            <img src="/logo.svg" alt="Revenew" className="h-5 w-auto" />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </Button>

          {user ? (
            <div className="hidden md:block">
              <UserMenu user={user} onLogout={logout} />
            </div>
          ) : null}
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {isMobileMenuOpen ? (
          <div className="fixed inset-0 top-(--header-height) z-40 overflow-y-auto bg-card md:hidden">
            <NavLinks
              onNavigate={closeMobileMenu}
              itemClassName="h-auto py-4 text-lg"
            />
            <div className="space-y-3 border-t border-border p-4">
              {user ? (
                <div className="truncate text-sm text-muted-foreground">
                  {user.display_name || user.email}
                </div>
              ) : null}
              <Button variant="outline" className="w-full" onClick={logout}>
                <LogOut />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        ) : null}

        <aside
          className={cn(
            "sticky top-(--header-height) hidden h-[calc(100vh-var(--header-height))] shrink-0 flex-col self-start overflow-y-auto border-r border-border bg-card transition-[width] duration-200 md:flex",
            sidebar.collapsed ? "w-16" : "w-64",
          )}
        >
          <NavLinks collapsed={sidebar.collapsed} />
          <div
            className={cn(
              "mt-auto border-t border-border p-4",
              sidebar.collapsed && "px-2",
            )}
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full text-muted-foreground",
                sidebar.collapsed ? "justify-center px-0" : "justify-start",
              )}
              onClick={sidebar.toggle}
              aria-label={sidebar.collapsed ? "Expandir menú" : "Colapsar menú"}
              aria-expanded={!sidebar.collapsed}
              title={sidebar.collapsed ? "Expandir menú" : undefined}
            >
              {sidebar.collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              {sidebar.collapsed ? null : "Colapsar menú"}
            </Button>
          </div>
        </aside>

        <main className="w-full flex-1 overflow-x-hidden p-4 md:p-8">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
