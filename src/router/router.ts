import { App } from "@/App";
import { login } from "@/pages/auth/login";
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
        Component: login,
      },
    ],
  },
]);

export { router };
