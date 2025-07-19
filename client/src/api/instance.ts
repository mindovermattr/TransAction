import { getUserFromLS } from "@/lib/localstorage";
import { ROUTES } from "@/router/routes";
import { ofetch, type FetchContext } from "ofetch";
import { redirect } from "react-router";

const HOST_URL = "http://localhost:3000";

const instance = ofetch.create({
  baseURL: HOST_URL,
});

const protectedInstance = ofetch.create({
  baseURL: HOST_URL,
  onRequest: ({ options }: FetchContext) => {
    const user = getUserFromLS();
    if (!user) return;
    options.headers.set("Bearer", user.token);
  },

  async onResponseError({ response }) {
    if (response.status === 401) {
      redirect(ROUTES.LOGIN);
    }
  },
});

export { instance, protectedInstance };
