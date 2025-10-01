import { useEffect } from "react";
import { Outlet } from "react-router";
import {
  getDataFromLocalStorage,
  LOCAL_STORAGE_KEYS,
} from "./lib/localstorage";

export const App = () => {
  useEffect(() => {
    if (getDataFromLocalStorage(LOCAL_STORAGE_KEYS.THEME) ?? false)
      document.documentElement.classList.add("dark");
  }, []);
  return (
    <div className="flex min-h-screen flex-col">
      <Outlet />
    </div>
  );
};
