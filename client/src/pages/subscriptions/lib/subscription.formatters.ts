import { getDaysUntil } from "@/lib/date";

const subscriptionDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
});

const formatNextChargeDate = (dateValue: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateValue}T00:00:00`));

const getRelativeDueLabel = (dateValue: string) => {
  const daysUntil = getDaysUntil(dateValue);

  if (daysUntil < 0) {
    return `Просрочено на ${Math.abs(daysUntil)} дн.`;
  }

  if (daysUntil === 0) {
    return "Спишется сегодня";
  }

  if (daysUntil === 1) {
    return "Спишется завтра";
  }

  if (daysUntil <= 7) {
    return `Через ${daysUntil} дн.`;
  }

  return subscriptionDateFormatter.format(new Date(`${dateValue}T00:00:00`));
};

export { formatNextChargeDate, getRelativeDueLabel, subscriptionDateFormatter };
