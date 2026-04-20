import type { ChartConfig } from "@/components/ui/chart";

const DASHBOARD_CATEGORY_LABELS: Record<TransactionTags, string> = {
  FOOD: "Еда",
  HOUSING: "Жильё",
  TRANSPORT: "Транспорт",
  EDUCATION: "Обучение",
  JOY: "Досуг",
  OTHER: "Другое",
};

const DASHBOARD_CHART_CONFIG: ChartConfig = {
  income: { label: "Доходы", color: "var(--color-chart-2)" },
  expenses: { label: "Расходы", color: "var(--color-chart-5)" },
  balance: { label: "Баланс", color: "var(--color-chart-1)" },
  total: { label: "Сумма", color: "var(--color-chart-4)" },
};

const DASHBOARD_CATEGORY_COLORS = [
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-1)",
  "var(--color-primary)",
];

export {
  DASHBOARD_CATEGORY_COLORS,
  DASHBOARD_CATEGORY_LABELS,
  DASHBOARD_CHART_CONFIG,
};
