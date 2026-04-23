const rubCurrencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const shortDayMonthFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
});

const formatRubCurrency = (value: number) => rubCurrencyFormatter.format(value);

const formatCompactNumber = (value: number) => compactNumberFormatter.format(value);

export { compactNumberFormatter, formatCompactNumber, formatRubCurrency, rubCurrencyFormatter, shortDayMonthFormatter };
