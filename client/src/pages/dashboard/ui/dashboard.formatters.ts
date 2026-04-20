import { DASHBOARD_CATEGORY_LABELS } from "./dashboard.constants";

const dashboardCurrencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const dashboardCompactFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatDashboardPercentDelta = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toLocaleString("ru-RU")}%`;

const formatDashboardCategoryLabel = (tag: TransactionTags) =>
  DASHBOARD_CATEGORY_LABELS[tag] ?? tag;

const formatDashboardDateLabel = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));

const formatDashboardMonthLabel = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    month: "short",
  })
    .format(new Date(value))
    .replace(".", "")
    .replace(/^\p{L}/u, (letter) => letter.toUpperCase());

export {
  dashboardCompactFormatter,
  dashboardCurrencyFormatter,
  formatDashboardCategoryLabel,
  formatDashboardDateLabel,
  formatDashboardMonthLabel,
  formatDashboardPercentDelta,
};
