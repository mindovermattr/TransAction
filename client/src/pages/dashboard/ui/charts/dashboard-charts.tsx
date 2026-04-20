import { DashboardCashflowCard } from "./dashboard-cashflow-card";
import { DashboardPeriodCompareCard } from "./dashboard-period-compare-card";
import { DashboardTopCategoriesCard } from "./dashboard-top-categories-card";
import { DashboardWeekdayCard } from "./dashboard-weekday-card";

type CashflowPoint = DashboardOverviewResponse["cashflow"]["months"][number] & {
  label: string;
};

type CategoryPoint = DashboardOverviewResponse["topCategories"][number] & {
  label: string;
  fill: string;
};

type PeriodComparePoint = {
  label: string;
  total: number;
  fill: string;
};

const DashboardCharts = ({
  cashflowPoints,
  categoryPoints,
  periodCompare,
  weekdayTotals,
}: {
  cashflowPoints: CashflowPoint[];
  categoryPoints: CategoryPoint[];
  periodCompare: PeriodComparePoint[];
  weekdayTotals: DashboardOverviewResponse["weekdayTotals"];
}) => (
  <>
    <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
      <DashboardCashflowCard data={cashflowPoints} />
      <div className="grid gap-4">
        <DashboardPeriodCompareCard data={periodCompare} />
        <DashboardTopCategoriesCard data={categoryPoints} />
      </div>
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <DashboardWeekdayCard data={weekdayTotals} />
    </div>
  </>
);

export { DashboardCharts };
