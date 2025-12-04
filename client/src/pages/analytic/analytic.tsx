import { useGetExpensesByWeekdayQuery } from "@/api/hooks";
import { useGetExpensesByCategoryQuery } from "@/api/hooks/expenses/useGetExpensesByCategoryQuery";
import { useGetExpensesTrendQuery } from "@/api/hooks/expenses/useGetExpensesTrendQuery";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { CategoryPieCard } from "./ui/category-pie-card";
import { ExpensesTrendCard } from "./ui/expenses-trend-card";
import { WeekdayExpensesCard } from "./ui/weekday-expenses-card";

const Analytic = () => {
  const period: AnalyticsPeriod = "month";

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetExpensesByCategoryQuery(period);
  const { data: trendData, isLoading: isTrendLoading } =
    useGetExpensesTrendQuery(period);
  const { data: weekdayData, isLoading: isWeekdayLoading } =
    useGetExpensesByWeekdayQuery(period);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Typography tag="h1" variant="title">
            Аналитика
          </Typography>
        </div>
        <Typography tag="p" className="text-muted-foreground text-sm">
          Период: последний месяц
        </Typography>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <CategoryPieCard data={categoryData} isLoading={isCategoryLoading} />
        <WeekdayExpensesCard data={weekdayData} isLoading={isWeekdayLoading} />
      </section>

      <section>
        <ExpensesTrendCard data={trendData} isLoading={isTrendLoading} />
      </section>
    </div>
  );
};

export { Analytic };
