const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const endOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
};

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toMonthInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const currentMonthValue = toMonthInputValue(new Date());

const getMonthDate = (value: string) => {
  const [year = "0", month = "1"] = value.split("-");
  return new Date(Number(year), Number(month) - 1, 1);
};

const formatMonthLabel = (value: string) => {
  const label = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(getMonthDate(value));

  return label.replace(/^\p{L}/u, (letter) => letter.toUpperCase());
};

const shiftMonthValue = (value: string, delta: number) => {
  const date = getMonthDate(value);
  date.setMonth(date.getMonth() + delta);
  return toMonthInputValue(date);
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getDaysUntil = (dateValue: string) => {
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(`${dateValue}T00:00:00`));
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
};

export {
  addDays,
  currentMonthValue,
  endOfDay,
  formatMonthLabel,
  getDaysUntil,
  getMonthDate,
  shiftMonthValue,
  startOfDay,
  toDateInputValue,
  toMonthInputValue,
};
