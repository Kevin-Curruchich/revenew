import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard, LoginGuard } from "@/modules/auth/components/AuthGuard";

// Auth
import { LoginPage } from "@/modules/auth/pages/LoginPage";

// Dashboard
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";

// Products
import { ProductListPage } from "@/modules/products/pages/ProductListPage";
import { ProductFormPage } from "@/modules/products/pages/ProductFormPage";

// Customers
import { CustomerListPage } from "@/modules/customers/pages/CustomerListPage";
import { CustomerFormPage } from "@/modules/customers/pages/CustomerFormPage";

// Sales
import { SalesListPage } from "@/modules/sales/pages/SalesListPage";
import { SaleFormPage } from "@/modules/sales/pages/SaleFormPage";

// Purchases
import { PurchasesListPage } from "@/modules/purchases/pages/PurchasesListPage";
import { PurchaseFormPage } from "@/modules/purchases/pages/PurchaseFormPage";

// Follow-up
import { FollowUpListPage } from "@/modules/follow-up/pages/FollowUpListPage";

// Calendar
import { CalendarPage } from "@/modules/calendar/pages/CalendarPage";

export const appRoute = createBrowserRouter([
  {
    path: "/login",
    element: <LoginGuard />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "products",
            children: [
              { index: true, element: <ProductListPage /> },
              { path: "new", element: <ProductFormPage /> },
              { path: ":id", element: <ProductFormPage /> },
            ],
          },
          {
            path: "customers",
            children: [
              { index: true, element: <CustomerListPage /> },
              { path: "new", element: <CustomerFormPage /> },
              { path: ":id", element: <CustomerFormPage /> },
            ],
          },
          {
            path: "sales",
            children: [
              { index: true, element: <SalesListPage /> },
              { path: "new", element: <SaleFormPage /> },
              { path: ":id", element: <SaleFormPage /> },
            ],
          },
          {
            path: "purchases",
            children: [
              { index: true, element: <PurchasesListPage /> },
              { path: "new", element: <PurchaseFormPage /> },
              { path: ":id", element: <PurchaseFormPage /> },
            ],
          },
          {
            path: "follow-up",
            element: <FollowUpListPage />,
          },
          {
            path: "calendar",
            element: <CalendarPage />,
          },
        ],
      },
    ],
  },
]);
