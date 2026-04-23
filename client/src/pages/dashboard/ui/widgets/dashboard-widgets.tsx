import { rubCurrencyFormatter } from "@/lib/formatters";
import { DashboardInsightCard } from "./dashboard-insight-card";
import { DashboardKpiCard } from "./dashboard-kpi-card";
import {
  formatDashboardCategoryLabel,
  formatDashboardDateLabel,
  formatDashboardPercentDelta,
} from "../dashboard.formatters";
import { TrendingDownIcon, TrendingUpIcon, Wallet2Icon } from "lucide-react";

const getBalanceDetail = (balance: number) => {
  if (balance > 0) {
    return `${rubCurrencyFormatter.format(balance)} осталось после трат в этом месяце`;
  }

  if (balance < 0) {
    return `${rubCurrencyFormatter.format(Math.abs(balance))} перерасхода в этом месяце`;
  }

  return "В этом месяце вышли в ноль после всех трат";
};

const getBudgetInsight = (data?: DashboardOverviewResponse["budgetAlerts"]) => {
  if (!data) {
    return {
      value: "—",
      hint: "Добавьте бюджеты, чтобы видеть перерасход заранее",
    };
  }

  if (data.activeCount === 0) {
    return {
      value: "Не настроены",
      hint: "Добавьте бюджеты, чтобы видеть перерасход заранее",
    };
  }

  if (data.overCount > 0) {
    return {
      value: `${data.overCount} сверх лимита`,
      hint: data.topOverBudgetTag
        ? `${formatDashboardCategoryLabel(data.topOverBudgetTag)} • перерасход ${rubCurrencyFormatter.format(
            data.topOverBudgetAmount,
          )}`
        : "Нужно пересмотреть лимиты и траты",
    };
  }

  if (data.warningCount > 0) {
    return {
      value: `${data.warningCount} близко к лимиту`,
      hint: "Самое время проверить категории риска до конца месяца",
    };
  }

  return {
    value: "Под контролем",
    hint: "В этом месяце бюджеты пока держатся в рамках лимитов",
  };
};

const DashboardWidgets = ({ data }: { data?: DashboardOverviewResponse }) => {
  const topCategory = data?.insights.topCategory;
  const peakSpendDay = data?.insights.peakSpendDay;
  const balance = data?.totals.balance ?? 0;
  const budgetInsight = getBudgetInsight(data?.budgetAlerts);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardKpiCard
          title="Баланс месяца"
          value={rubCurrencyFormatter.format(balance)}
          detail={getBalanceDetail(balance)}
          icon={Wallet2Icon}
          tone="balance"
        />
        <DashboardKpiCard
          title="Доходы месяца"
          value={rubCurrencyFormatter.format(data?.totals.income ?? 0)}
          detail={`${formatDashboardPercentDelta(data?.comparisons.incomeDeltaPercent ?? 0)} к прошлому месяцу`}
          icon={TrendingUpIcon}
          tone="income"
        />
        <DashboardKpiCard
          title="Расходы месяца"
          value={rubCurrencyFormatter.format(data?.totals.expenses ?? 0)}
          detail={`${formatDashboardPercentDelta(data?.comparisons.expensesDeltaPercent ?? 0)} к прошлому месяцу`}
          icon={TrendingDownIcon}
          tone="expense"
        />
      </div>

      <section className="bg-card rounded-xl border p-4 lg:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-foreground text-lg font-semibold">Что важно сейчас</h2>
            <p className="text-muted-foreground text-sm">Краткие сигналы по текущему месяцу</p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <DashboardInsightCard
            title="Топ категория"
            value={topCategory ? formatDashboardCategoryLabel(topCategory.tag) : "—"}
            hint={
              topCategory
                ? `${rubCurrencyFormatter.format(topCategory.total)} • ${topCategory.sharePercent}% всех расходов`
                : "Добавьте расходы, чтобы увидеть лидера"
            }
          />
          <DashboardInsightCard title="Бюджеты" value={budgetInsight.value} hint={budgetInsight.hint} />
          <DashboardInsightCard
            title="Пиковый день"
            value={peakSpendDay ? formatDashboardDateLabel(peakSpendDay.date) : "—"}
            hint={
              peakSpendDay ? `${rubCurrencyFormatter.format(peakSpendDay.total)} за день` : "Пока нет данных по тратам"
            }
          />
        </div>
      </section>
    </>
  );
};

export { DashboardWidgets };
