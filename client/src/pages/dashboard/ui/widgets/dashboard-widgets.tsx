import { DashboardInsightCard } from "./dashboard-insight-card";
import { DashboardKpiCard } from "./dashboard-kpi-card";
import {
  dashboardCurrencyFormatter,
  formatDashboardCategoryLabel,
  formatDashboardDateLabel,
  formatDashboardPercentDelta,
} from "../dashboard.formatters";
import { TrendingDownIcon, TrendingUpIcon, Wallet2Icon } from "lucide-react";

const getBalanceDetail = (balance: number) => {
  if (balance > 0) {
    return `${dashboardCurrencyFormatter.format(balance)} осталось после трат в этом месяце`;
  }

  if (balance < 0) {
    return `${dashboardCurrencyFormatter.format(Math.abs(balance))} перерасхода в этом месяце`;
  }

  return "В этом месяце вышли в ноль после всех трат";
};

const DashboardWidgets = ({ data }: { data?: DashboardOverviewResponse }) => {
  const topCategory = data?.insights.topCategory;
  const peakSpendDay = data?.insights.peakSpendDay;
  const balance = data?.totals.balance ?? 0;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardKpiCard
          title="Баланс месяца"
          value={dashboardCurrencyFormatter.format(balance)}
          detail={getBalanceDetail(balance)}
          icon={Wallet2Icon}
          tone="balance"
        />
        <DashboardKpiCard
          title="Доходы месяца"
          value={dashboardCurrencyFormatter.format(data?.totals.income ?? 0)}
          detail={`${formatDashboardPercentDelta(data?.comparisons.incomeDeltaPercent ?? 0)} к прошлому месяцу`}
          icon={TrendingUpIcon}
          tone="income"
        />
        <DashboardKpiCard
          title="Расходы месяца"
          value={dashboardCurrencyFormatter.format(data?.totals.expenses ?? 0)}
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
                ? `${dashboardCurrencyFormatter.format(topCategory.total)} • ${topCategory.sharePercent}% всех расходов`
                : "Добавьте расходы, чтобы увидеть лидера"
            }
          />
          <DashboardInsightCard
            title="Изменение трат"
            value={formatDashboardPercentDelta(data?.comparisons.expensesDeltaPercent ?? 0)}
            hint={`Было ${dashboardCurrencyFormatter.format(data?.comparisons.previousExpenses ?? 0)} в прошлом месяце`}
          />
          <DashboardInsightCard
            title="Пиковый день"
            value={peakSpendDay ? formatDashboardDateLabel(peakSpendDay.date) : "—"}
            hint={
              peakSpendDay
                ? `${dashboardCurrencyFormatter.format(peakSpendDay.total)} за день`
                : "Пока нет данных по тратам"
            }
          />
        </div>
      </section>
    </>
  );
};

export { DashboardWidgets };
