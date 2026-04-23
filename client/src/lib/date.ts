const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export { addDays, getDaysUntil, startOfDay, toDateInputValue };
