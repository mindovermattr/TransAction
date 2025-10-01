import { App } from "@/App";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Login } from "@/pages/auth/login";
import { Registration } from "@/pages/auth/registration";
import { Transactions } from "@/pages/transactions/transactions";
import { Providers } from "@/providers";
import { createBrowserRouter, Outlet, redirect } from "react-router";
import { protectedLoader } from "./protected-loader";
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
        path: ROUTES.LOGIN,
        Component: Login,
      },
      {
        path: ROUTES.REGISTER,
        Component: Registration,
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
        children: [{ path: ROUTES.TRANSACTIONS, Component: Transactions }],
      },
      //other routes
      {
        path: "*",
        element: null,
        loader: () => redirect(ROUTES.TRANSACTIONS),
      },
    ],
  },
]);

export { router };
