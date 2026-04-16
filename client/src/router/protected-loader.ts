import {
  getDataFromLocalStorage,
  LOCAL_STORAGE_KEYS,
} from "@/lib/localstorage";
import { redirect } from "react-router";
import { ROUTES } from "./routes";

const isAuthenticated = () => {
  const user = getDataFromLocalStorage(LOCAL_STORAGE_KEYS.USER);
  return Boolean(user?.token);
};

const protectedLoader = async () => {
  if (!isAuthenticated()) {
    return redirect(ROUTES.LOGIN);
  }
  return;
};

const publicLoader = async () => {
  if (!isAuthenticated()) {
    return redirect(ROUTES.LOGIN);
  }
  return redirect(ROUTES.TRANSACTIONS);
};

export { protectedLoader, publicLoader };
