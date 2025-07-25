interface UserLS extends User {
  token: string;
}

const LOCAL_STORAGE_KEYS = {
  USER: "user",
} as const;

const getUserFromLS = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.USER) ?? "";
  if (!data) return null;
  const user = JSON.parse(data);

  return user as UserLS;
};

const setUserLS = (user: UserLS) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
};

const removeUserFromLS = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
};

export { getUserFromLS, LOCAL_STORAGE_KEYS, removeUserFromLS, setUserLS };
