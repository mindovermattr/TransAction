import { App } from "@/App";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Providers } from "@/providers";
import { createBrowserRouter, Outlet } from "react-router";
import { protectedLoader, publicLoader } from "./protected-loader";
import { ROUTES } from "./routes";

const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,

    element: (
      <Providers>
        <App />
      </Providers>
    ),
    children: [
      {
        index: true,
        loader: publicLoader,
      },
      {
        path: ROUTES.LOGIN,
        lazy: async () => ({
          Component: (await import("@/pages/auth/login")).Login,
        }),
      },
      {
        path: ROUTES.REGISTER,
        lazy: async () => ({
          Component: (await import("@/pages/auth/registration")).Registration,
        }),
      },
      //protected routes
      {
        loader: protectedLoader,
        element: (
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="m-4 gap-4">
              <Outlet />
            </SidebarInset>
          </SidebarProvider>
        ),
        children: [
          {
            path: ROUTES.DASHBOARD,
            lazy: async () => ({
              Component: (await import("@/pages/dashboard/dashboard")).Dashboard,
            }),
          },
          {
            path: ROUTES.TRANSACTIONS,
            lazy: async () => ({
              Component: (await import("@/pages/transactions/transactions")).Transactions,
            }),
          },
          {
            path: ROUTES.ANALYTICS,
            lazy: async () => ({
              Component: (await import("@/pages/analytic/analytic")).Analytic,
            }),
          },
        ],
      },
      //other routes
      {
        path: "*",
        element: null,
        loader: publicLoader,
      },
    ],
  },
]);

export { router };
