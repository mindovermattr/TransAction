import { useGetExpensesByWeekdayQuery } from "@/api/hooks";
import { useGetExpensesByCategoryQuery } from "@/api/hooks/expenses/useGetExpensesByCategoryQuery";
import { useGetExpensesTrendQuery } from "@/api/hooks/expenses/useGetExpensesTrendQuery";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { useState } from "react";
import { CategoryPieCard } from "./ui/category-pie-card";
import { ExpensesTrendCard } from "./ui/expenses-trend-card";
import { WeekdayExpensesCard } from "./ui/weekday-expenses-card";

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "month", label: "Месяц" },
  { value: "halfYear", label: "Полгода" },
  { value: "year", label: "Год" },
];

const PERIOD_DESCRIPTION_MAP: Record<AnalyticsPeriod, string> = {
  month: "последний месяц",
  quarter: "последний квартал",
  halfYear: "последние полгода",
  year: "последний год",
};

const Analytic = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");

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
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={period === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Период: {PERIOD_DESCRIPTION_MAP[period]}
          </Typography>
        </div>
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
