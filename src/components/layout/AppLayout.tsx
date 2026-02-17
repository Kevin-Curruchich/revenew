import { Link, Outlet, useLocation } from "react-router";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/customers", label: "Clientes", icon: "👥" },
  { path: "/sales", label: "Ventas", icon: "💰" },
  { path: "/follow-up", label: "Seguimiento", icon: "📋" },
  { path: "/calendar", label: "Calendario", icon: "📅" },
];

export const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-blue-600">Revenew</h1>
              <span className="text-sm text-gray-500">Admin Panel</span>
            </div>

            {/* <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">usuario@revenew.com</span>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Cerrar Sesión
                </Button>
              </Link>
            </div> */}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path}>
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
        <main className="flex-1 p-8">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
