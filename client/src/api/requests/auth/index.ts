import { instance } from "@/api/instance";

export type LoginConfig = OfetchRequestConfig;

export const login = async (requestConfig?: LoginConfig) =>
  instance<LoginResponse>("users", requestConfig?.config);

export type PostUserParams = Omit<User, "id">;
export type PostUserConfig = OfetchRequestConfig<PostUserParams>;

export const register = async ({ params, config }: PostUserConfig) =>
  instance("users", {
    method: "POST",
    body: params,
    ...config,
  });
