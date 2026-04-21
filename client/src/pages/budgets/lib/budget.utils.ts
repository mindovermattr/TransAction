import { BUDGET_TAG_LABELS } from "./budget.constants";
import { budgetCurrencyFormatter } from "./budget.formatters";

const BUDGET_STATUS_SEVERITY: Record<BudgetStatus, number> = {
  over: 0,
  warning: 1,
  ok: 2,
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      data?: {
        message?: string;
      };
      message?: string;
    };

    if (typeof apiError.data?.message === "string" && apiError.data.message.length > 0) {
      return apiError.data.message;
    }

    if (typeof apiError.message === "string" && apiError.message.length > 0) {
      return apiError.message;
    }
  }

  return fallback;
};

const getBudgetStatusBadgeProps = (status: BudgetStatus) => {
  if (status === "over") {
    return {
      label: "Сверх лимита",
      className: "border-transparent bg-destructive text-destructive-foreground",
    };
  }

  if (status === "warning") {
    return {
      label: "Близко к лимиту",
      className: "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300",
    };
  }

  return {
    label: "Норма",
    className: "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  };
};

const getBudgetProgressBarClassName = (status: BudgetStatus) => {
  if (status === "over") {
    return "bg-destructive";
  }

  if (status === "warning") {
    return "bg-amber-500";
  }

  return "bg-primary";
};

const sortBudgets = (items: Budget[]) =>
  [...items].sort((left, right) => {
    return (
      BUDGET_STATUS_SEVERITY[left.status] - BUDGET_STATUS_SEVERITY[right.status] ||
      right.progressPercent - left.progressPercent ||
      left.tag.localeCompare(right.tag)
    );
  });

const getBudgetAlertCard = ({
  primaryBudget,
  summary,
}: {
  primaryBudget: Budget | null;
  summary: BudgetsResponse["summary"];
}) => {
  if (summary.overCount > 0) {
    const overspend = primaryBudget?.status === "over" ? Math.abs(primaryBudget.remaining) : 0;
    return {
      title: `${summary.overCount} бюджет${summary.overCount === 1 ? "" : summary.overCount < 5 ? "а" : "ов"} сверх лимита`,
      hint:
        primaryBudget?.status === "over"
          ? `${BUDGET_TAG_LABELS[primaryBudget.tag]} • перерасход ${budgetCurrencyFormatter.format(overspend)}`
          : "Нужно поднять лимит или сократить траты",
      className: "border-destructive/20 bg-destructive/10",
      valueClassName: "text-destructive",
    };
  }

  if (summary.warningCount > 0) {
    return {
      title: `${summary.warningCount} бюджета близко к лимиту`,
      hint:
        primaryBudget?.status === "warning"
          ? `${BUDGET_TAG_LABELS[primaryBudget.tag]} • ${primaryBudget.progressPercent}% лимита`
          : "Проверьте категории, которые скоро упрутся в лимит",
      className: "border-amber-500/25 bg-amber-500/10",
      valueClassName: "text-amber-700 dark:text-amber-300",
    };
  }

  if (summary.activeCount > 0) {
    return {
      title: "Бюджеты под контролем",
      hint: `Активных бюджетов: ${summary.activeCount}. Остаток ${budgetCurrencyFormatter.format(summary.totalRemaining)}.`,
      className: "border-emerald-500/25 bg-emerald-500/10",
      valueClassName: "text-emerald-700 dark:text-emerald-300",
    };
  }

  return {
    title: "На этот месяц бюджеты не созданы",
    hint: "Добавьте лимиты по категориям, чтобы видеть перерасход заранее.",
    className: "border-border/70 bg-muted/35",
    valueClassName: "text-foreground",
  };
};

export { getApiErrorMessage, getBudgetAlertCard, getBudgetProgressBarClassName, getBudgetStatusBadgeProps, sortBudgets };
