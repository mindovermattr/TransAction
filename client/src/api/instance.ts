import { getUserFromLS, removeUserFromLS } from "@/lib/localstorage";
import type { FetchContext } from "ofetch";
import { ofetch } from "ofetch";

const HOST_URL = "http://localhost:3000";

const instance = ofetch.create({
  baseURL: HOST_URL,
});

const protectedInstance = ofetch.create({
  baseURL: HOST_URL,
  onRequest: ({ options }: FetchContext) => {
    const user = getUserFromLS();
    if (!user) return;
    options.headers.set("Authorization", `Bearer ${user.token}`);
  },

  async onResponseError({ response }) {
    if (response.status === 401) {
      removeUserFromLS();
    }
  },
});

export { instance, protectedInstance };
