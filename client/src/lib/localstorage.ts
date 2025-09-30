interface UserWithToken extends User {
  token: string;
}

const LOCAL_STORAGE_KEYS = {
  USER: "user",
  THEME: "theme",
} as const;

type LocalStorageData = {
  [LOCAL_STORAGE_KEYS.USER]: UserWithToken;
  [LOCAL_STORAGE_KEYS.THEME]: { theme: "dark" | "light" };
};

type LSkey = keyof LocalStorageData;

const getDataFromLocalStorage = <T extends LSkey>() => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.USER) ?? "";
  if (!data) return null;
  const user = JSON.parse(data);

  return user as LocalStorageData[T];
};

const setDataLocalStorage = <T extends LSkey>(
  key: T,
  data: LocalStorageData[T],
) => localStorage.setItem(key, JSON.stringify(data));

const removeDataFromLocalStorage = (key: LSkey) => {
  localStorage.removeItem(key);
};

export {
  getDataFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeDataFromLocalStorage,
  setDataLocalStorage,
};
