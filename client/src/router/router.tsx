import { App } from "@/App";
import { Login } from "@/pages/auth/login";
import { Registration } from "@/pages/auth/registration";
import { Transactions } from "@/pages/transactions";
import { Providers } from "@/providers";
import { createBrowserRouter } from "react-router";
import { ROUTES } from "./routes";

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
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
      {
        path: ROUTES.TRANSACTIONS,
        Component: Transactions,
      },
    ],
  },
]);

export { router };
