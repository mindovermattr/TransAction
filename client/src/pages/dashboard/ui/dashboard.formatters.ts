import { shortDayMonthFormatter } from "@/lib/formatters";
import { DASHBOARD_CATEGORY_LABELS } from "./dashboard.constants";

const formatDashboardPercentDelta = (value: number) => `${value > 0 ? "+" : ""}${value.toLocaleString("ru-RU")}%`;

const formatDashboardCategoryLabel = (tag: TransactionTags) => DASHBOARD_CATEGORY_LABELS[tag] ?? tag;

const formatDashboardDateLabel = (value: string) => shortDayMonthFormatter.format(new Date(value));

const formatDashboardMonthLabel = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    month: "short",
  })
    .format(new Date(value))
    .replace(".", "")
    .replace(/^\p{L}/u, (letter) => letter.toUpperCase());

export {
  formatDashboardCategoryLabel,
  formatDashboardDateLabel,
  formatDashboardMonthLabel,
  formatDashboardPercentDelta,
};
