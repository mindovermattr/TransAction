import { Outlet } from "react-router";

export const app = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Outlet />
    </div>
  );
};
