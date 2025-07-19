import type { User } from "@/@types/user";

interface UserLS extends User {
  token: string;
}

const LOCAL_STORAGE_KEYS = {
  USER: "user",
} as const;

const getUserFromLS = () => {
  const user = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USER) ?? "");
  if (!user) return null;
  return user as UserLS;
};

const setUserLS = (user: UserLS) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
};

export { getUserFromLS, setUserLS };
