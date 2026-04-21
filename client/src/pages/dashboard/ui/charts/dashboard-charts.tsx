import { DashboardCashflowCard } from "./dashboard-cashflow-card";
import { DashboardPeriodCompareCard } from "./dashboard-period-compare-card";
import { DashboardTopCategoriesCard } from "./dashboard-top-categories-card";
import { DashboardWeekdayCard } from "./dashboard-weekday-card";

type CashflowPoint = DashboardOverviewResponse["cashflow"]["months"][number] & {
  label: string;
  signedExpenses: number;
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
  totalExpenses,
  weekdayTotals,
}: {
  cashflowPoints: CashflowPoint[];
  categoryPoints: CategoryPoint[];
  periodCompare: PeriodComparePoint[];
  totalExpenses: number;
  weekdayTotals: DashboardOverviewResponse["weekdayTotals"];
}) => (
  <div className="grid gap-4 xl:grid-cols-12">
    <div className="xl:col-span-7">
      <DashboardCashflowCard data={cashflowPoints} />
    </div>
    <div className="xl:col-span-5">
      <DashboardPeriodCompareCard data={periodCompare} />
    </div>
    <div className="xl:col-span-7">
      <DashboardWeekdayCard data={weekdayTotals} />
    </div>
    <div className="xl:col-span-5">
      <DashboardTopCategoriesCard data={categoryPoints} totalExpenses={totalExpenses} />
    </div>
  </div>
);

export { DashboardCharts };
