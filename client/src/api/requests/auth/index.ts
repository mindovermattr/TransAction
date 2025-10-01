import { instance } from "@/api/instance";

export type LoginResponse = User & {
  token: string;
};
export type LoginParams = Omit<User, "id" | "name"> & { password: string };
export type LoginConfig = OfetchRequestConfig<LoginParams>;

export const login = ({ params, config }: LoginConfig) =>
  instance<LoginResponse>("auth/login", {
    method: "POST",
    body: params,
    ...config,
  });

export type RegisterParams = Omit<User, "id"> & {
  password: string;
  confirmPassword: string;
};
export type RegisterConfig = OfetchRequestConfig<RegisterParams>;

export const register = ({ params, config }: RegisterConfig) =>
  instance("auth/register", {
    method: "POST",
    body: params,
    ...config,
  });
