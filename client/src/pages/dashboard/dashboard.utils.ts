import { DASHBOARD_CATEGORY_COLORS } from "./ui/dashboard.constants";
import {
  formatDashboardCategoryLabel,
  formatDashboardMonthLabel,
} from "./ui/dashboard.formatters";

const getDashboardCashflowPoints = (
  months: DashboardOverviewResponse["cashflow"]["months"] | undefined,
) =>
  (months ?? []).map((item) => ({
    ...item,
    signedExpenses: item.expenses > 0 ? -item.expenses : 0,
    label: formatDashboardMonthLabel(item.monthStart),
  }));

const getDashboardCategoryPoints = (
  topCategories: DashboardOverviewResponse["topCategories"] | undefined,
) =>
  (topCategories ?? []).map((item, index) => ({
    ...item,
    label: formatDashboardCategoryLabel(item.tag),
    fill: DASHBOARD_CATEGORY_COLORS[index % DASHBOARD_CATEGORY_COLORS.length],
  }));

const getDashboardPeriodCompare = (
  totals: DashboardOverviewResponse["totals"] | undefined,
) => [
  {
    label: "Доходы",
    total: totals?.income ?? 0,
    fill: "var(--color-income)",
  },
  {
    label: "Расходы",
    total: totals?.expenses ?? 0,
    fill: "var(--color-expenses)",
  },
];

export {
  getDashboardCashflowPoints,
  getDashboardCategoryPoints,
  getDashboardPeriodCompare,
};
