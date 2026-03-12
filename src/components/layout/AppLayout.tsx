import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/products", label: "Productos", icon: "📦" },
  { path: "/customers", label: "Clientes", icon: "👥" },
  { path: "/sales", label: "Ventas", icon: "💰" },
  { path: "/follow-up", label: "Seguimiento", icon: "📋" },
  { path: "/calendar", label: "Calendario", icon: "📅" },
];

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <h1 className="text-2xl font-bold text-blue-600">Revenew</h1>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-600">
                  {user.display_name}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[73px] z-40 bg-white overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className="block"
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start text-lg py-6"
                    >
                      <span className="mr-3 text-2xl">{item.icon}</span>
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} className="block">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
