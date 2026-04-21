import type { BudgetMonthOption } from "./budget.types";

const currentMonthValue = new Date().toISOString().slice(0, 7);

const getMonthDate = (value: string) => new Date(`${value}-01T00:00:00.000Z`);

const formatMonthLabel = (value: string) => {
  const label = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(getMonthDate(value));

  return label.replace(/^\p{L}/u, (letter) => letter.toUpperCase());
};

const shiftMonthValue = (value: string, delta: number) => {
  const date = getMonthDate(value);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 7);
};

const getBudgetMonthOptions = (anchorMonth: string): BudgetMonthOption[] =>
  Array.from({ length: 8 }, (_, index) => {
    const value = shiftMonthValue(anchorMonth, index - 3);
    return {
      value,
      label: formatMonthLabel(value),
      isCurrent: value === currentMonthValue,
    };
  });

export { currentMonthValue, formatMonthLabel, getBudgetMonthOptions, getMonthDate, shiftMonthValue };
