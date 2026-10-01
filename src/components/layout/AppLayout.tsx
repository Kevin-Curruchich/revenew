import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { LogOut, Menu, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/modules/auth";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/agent", label: "Asistente", icon: "🤖" },
  { path: "/products", label: "Productos", icon: "📦" },
  { path: "/purchases", label: "Compras", icon: "🛒" },
  { path: "/customers", label: "Clientes", icon: "👥" },
  { path: "/sales", label: "Ventas", icon: "💰" },
  { path: "/cash", label: "Caja", icon: "💵" },
  { path: "/follow-up", label: "Seguimiento", icon: "📋" },
  { path: "/calendar", label: "Calendario", icon: "📅" },
];

interface NavLinksProps {
  onNavigate?: () => void;
  className?: string;
  itemClassName?: string;
}

const NavLinks = ({ onNavigate, className, itemClassName }: NavLinksProps) => (
  <nav className={cn("flex flex-col gap-2 p-4", className)}>
    {navItems.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            buttonVariants({ variant: isActive ? "default" : "ghost" }),
            "w-full justify-start",
            itemClassName,
          )
        }
      >
        <span aria-hidden="true">{item.icon}</span>
        {item.label}
      </NavLink>
    ))}
  </nav>
);

export const AppLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

          <div className="hidden items-center gap-4 md:flex">
            {user?.display_name ? (
              <span className="text-sm text-muted-foreground">
                {user.display_name}
              </span>
            ) : null}
            {/* The auth guard redirects to /login once the session ends. */}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {isMobileMenuOpen ? (
          <div className="fixed inset-0 top-(--header-height) z-40 overflow-y-auto bg-card md:hidden">
            <NavLinks
              onNavigate={closeMobileMenu}
              itemClassName="h-auto py-4 text-lg"
            />
            <div className="border-t border-border p-4">
              <Button variant="outline" className="w-full" onClick={logout}>
                <LogOut />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        ) : null}

        <aside className="sticky top-(--header-height) hidden min-h-[calc(100vh-var(--header-height))] w-64 self-start border-r border-border bg-card md:block">
          <NavLinks />
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
