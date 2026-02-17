import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth
import { LoginPage } from "@/modules/auth/pages/LoginPage";

// Dashboard
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";

// Customers
import { CustomerListPage } from "@/modules/customers/pages/CustomerListPage";
import { CustomerFormPage } from "@/modules/customers/pages/CustomerFormPage";

// Sales
import { SalesListPage } from "@/modules/sales/pages/SalesListPage";
import { SaleFormPage } from "@/modules/sales/pages/SaleFormPage";

// Follow-up
import { FollowUpListPage } from "@/modules/follow-up/pages/FollowUpListPage";

// Calendar
import { CalendarPage } from "@/modules/calendar/pages/CalendarPage";

export const appRoute = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/customers",
        element: <CustomerListPage />,
      },
      {
        path: "/customers/new",
        element: <CustomerFormPage />,
      },
      {
        path: "/customers/:id",
        element: <CustomerFormPage />,
      },
      {
        path: "/sales",
        element: <SalesListPage />,
      },
      {
        path: "/sales/new",
        element: <SaleFormPage />,
      },
      {
        path: "/sales/:id",
        element: <SaleFormPage />,
      },
      {
        path: "/follow-up",
        element: <FollowUpListPage />,
      },
      {
        path: "/calendar",
        element: <CalendarPage />,
      },
    ],
  },
]);
