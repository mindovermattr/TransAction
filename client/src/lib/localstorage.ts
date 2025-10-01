interface UserWithToken extends User {
  token: string;
}

const LOCAL_STORAGE_KEYS = {
  USER: "user",
  THEME: "theme",
} as const;

type LocalStorageData = {
  [LOCAL_STORAGE_KEYS.USER]: UserWithToken;
  [LOCAL_STORAGE_KEYS.THEME]: boolean;
};

type LSkey = keyof LocalStorageData;

const getDataFromLocalStorage = <T extends LSkey>(key: T) => {
  const item = localStorage.getItem(key);
  if (!item) return null;
  const data = JSON.parse(item);

  return data as LocalStorageData[T];
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
