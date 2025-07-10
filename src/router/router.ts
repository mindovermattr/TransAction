import App from "@/App";
import { createBrowserRouter } from "react-router";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  BOARDS: "/boards",
  BOARD: "/boards/:boardId",
} as const;

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
]);

export { router };
