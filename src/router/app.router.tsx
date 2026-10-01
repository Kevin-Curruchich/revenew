import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { FullPageLoader } from "@/components/ui/loading-spinner";
import { AuthGuard, LoginGuard } from "@/modules/auth";
import { NotFoundPage, RouteErrorPage } from "./RouteErrorPage";

/**
 * Pages are code-split: each module is only downloaded the first time the
 * user navigates to it.
 */
const page = (load: () => Promise<RouteObject["Component"]>) => ({
  lazy: async () => ({ Component: await load() }),
});

export const appRouter = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <FullPageLoader />,
    children: [
      {
        path: "/login",
        element: <LoginGuard />,
        children: [
          {
            index: true,
            ...page(() =>
              import("@/modules/auth/pages/LoginPage").then((m) => m.LoginPage),
            ),
          },
        ],
      },
      {
        element: <AuthGuard />,
        children: [
          {
            element: <AppLayout />,
            errorElement: <RouteErrorPage />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              {
                path: "dashboard",
                ...page(() =>
                  import("@/modules/dashboard").then((m) => m.DashboardPage),
                ),
              },
              {
                path: "products",
                children: [
                  {
                    index: true,
                    ...page(() =>
                      import("@/modules/products").then(
                        (m) => m.ProductListPage,
                      ),
                    ),
                  },
                  {
                    path: "new",
                    ...page(() =>
                      import("@/modules/products").then(
                        (m) => m.ProductFormPage,
                      ),
                    ),
                  },
                  {
                    path: ":id",
                    ...page(() =>
                      import("@/modules/products").then(
                        (m) => m.ProductFormPage,
                      ),
                    ),
                  },
                ],
              },
              {
                path: "customers",
                children: [
                  {
                    index: true,
                    ...page(() =>
                      import("@/modules/customers").then(
                        (m) => m.CustomerListPage,
                      ),
                    ),
                  },
                  {
                    path: "new",
                    ...page(() =>
                      import("@/modules/customers").then(
                        (m) => m.CustomerFormPage,
                      ),
                    ),
                  },
                  {
                    path: ":id",
                    ...page(() =>
                      import("@/modules/customers").then(
                        (m) => m.CustomerFormPage,
                      ),
                    ),
                  },
                ],
              },
              {
                path: "sales",
                children: [
                  {
                    index: true,
                    ...page(() =>
                      import("@/modules/sales").then((m) => m.SalesListPage),
                    ),
                  },
                  {
                    path: "new",
                    ...page(() =>
                      import("@/modules/sales").then((m) => m.SaleFormPage),
                    ),
                  },
                  {
                    path: ":id",
                    ...page(() =>
                      import("@/modules/sales").then((m) => m.SaleFormPage),
                    ),
                  },
                ],
              },
              {
                path: "purchases",
                children: [
                  {
                    index: true,
                    ...page(() =>
                      import("@/modules/purchases").then(
                        (m) => m.PurchasesListPage,
                      ),
                    ),
                  },
                  {
                    path: "new",
                    ...page(() =>
                      import("@/modules/purchases").then(
                        (m) => m.PurchaseFormPage,
                      ),
                    ),
                  },
                  {
                    path: ":id",
                    ...page(() =>
                      import("@/modules/purchases").then(
                        (m) => m.PurchaseFormPage,
                      ),
                    ),
                  },
                ],
              },
              {
                path: "cash",
                ...page(() =>
                  import("@/modules/cash").then((m) => m.CashPage),
                ),
              },
              {
                path: "follow-up",
                ...page(() =>
                  import("@/modules/follow-up").then((m) => m.FollowUpListPage),
                ),
              },
              {
                path: "agent",
                ...page(() =>
                  import("@/modules/agent").then((m) => m.AgentPage),
                ),
                children: [
                  {
                    index: true,
                    ...page(() =>
                      import("@/modules/agent").then((m) => m.AgentHomePage),
                    ),
                  },
                  {
                    path: ":threadId",
                    ...page(() =>
                      import("@/modules/agent").then((m) => m.AgentThreadPage),
                    ),
                  },
                ],
              },
              {
                path: "calendar",
                ...page(() =>
                  import("@/modules/calendar").then((m) => m.CalendarPage),
                ),
              },
              { path: "*", element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
