import { DashboardInsightCard } from "./dashboard-insight-card";
import { DashboardKpiCard } from "./dashboard-kpi-card";
import {
  dashboardCurrencyFormatter,
  formatDashboardCategoryLabel,
  formatDashboardDateLabel,
  formatDashboardPercentDelta,
} from "../dashboard.formatters";
import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  Wallet2Icon,
} from "lucide-react";

const DashboardWidgets = ({
  data,
}: {
  data?: DashboardOverviewResponse;
}) => {
  const topCategory = data?.insights.topCategory;
  const peakSpendDay = data?.insights.peakSpendDay;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard
          title="Баланс месяца"
          value={dashboardCurrencyFormatter.format(data?.totals.balance ?? 0)}
          detail={`${data?.totals.savingsRate ?? 0}% сбережений от дохода`}
          icon={Wallet2Icon}
        />
        <DashboardKpiCard
          title="Доходы месяца"
          value={dashboardCurrencyFormatter.format(data?.totals.income ?? 0)}
          detail={`${formatDashboardPercentDelta(data?.comparisons.incomeDeltaPercent ?? 0)} к прошлому месяцу`}
          icon={TrendingUpIcon}
        />
        <DashboardKpiCard
          title="Расходы месяца"
          value={dashboardCurrencyFormatter.format(data?.totals.expenses ?? 0)}
          detail={`${formatDashboardPercentDelta(data?.comparisons.expensesDeltaPercent ?? 0)} к прошлому месяцу`}
          icon={TrendingDownIcon}
        />
        <DashboardKpiCard
          title="Savings rate"
          value={`${data?.totals.savingsRate ?? 0}%`}
          detail="Часть дохода, которая осталась после расходов"
          icon={PiggyBankIcon}
        />
      </div>

      <section className="rounded-xl border bg-card p-4 lg:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-foreground text-lg font-semibold">Что важно сейчас</h2>
            <p className="text-muted-foreground text-sm">
              Краткие сигналы по текущему месяцу
            </p>
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
            value={formatDashboardPercentDelta(
              data?.comparisons.expensesDeltaPercent ?? 0,
            )}
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
