import {
  getDataFromLocalStorage,
  LOCAL_STORAGE_KEYS,
} from "@/lib/localstorage";
import { redirect } from "react-router";
import { ROUTES } from "./routes";

const protectedLoader = async () => {
  const user = getDataFromLocalStorage(LOCAL_STORAGE_KEYS.USER);
  if (!user) {
    return redirect(ROUTES.LOGIN);
  }
  return;
};

export { protectedLoader };
