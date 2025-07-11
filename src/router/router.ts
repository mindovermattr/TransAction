import { App } from "@/App";
import { Login } from "@/pages/auth/login";
import { Registration } from "@/pages/auth/registration";
import { createBrowserRouter } from "react-router";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    Component: App,
    children: [
      {
        path: ROUTES.LOGIN,
        Component: Login,
      },
      {
        path: ROUTES.REGISTER,
        Component: Registration,
      },
    ],
  },
]);

export { router };
