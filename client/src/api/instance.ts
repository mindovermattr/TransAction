import {
  getDataFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeDataFromLocalStorage,
} from "@/lib/localstorage";
import { ROUTES } from "@/router/routes";
import type { FetchContext } from "ofetch";
import { ofetch } from "ofetch";

const HOST_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const instance = ofetch.create({
  baseURL: HOST_URL,
});

const protectedInstance = ofetch.create({
  baseURL: HOST_URL,
  onRequest: ({ options }: FetchContext) => {
    const user = getDataFromLocalStorage(LOCAL_STORAGE_KEYS.USER);
    if (!user) return;
    options.headers.set("Authorization", `Bearer ${user.token}`);
  },

  async onResponseError({ response }) {
    if (response.status === 401) {
      removeDataFromLocalStorage(LOCAL_STORAGE_KEYS.USER);
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.replace(ROUTES.LOGIN);
      }
    }
  },
});

export { instance, protectedInstance };
