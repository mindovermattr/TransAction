import { useGetExpensesByWeekdayQuery } from "@/api/hooks";
import { useGetExpensesByCategoryQuery } from "@/api/hooks/expenses/useGetExpensesByCategoryQuery";
import { useGetExpensesTrendQuery } from "@/api/hooks/expenses/useGetExpensesTrendQuery";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { useState } from "react";
import { CategoryPieCard } from "./ui/category-pie-card";
import { ExpensesTrendCard } from "./ui/expenses-trend-card";
import { WeekdayExpensesCard } from "./ui/weekday-expenses-card";

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "month", label: "Месяц" },
  { value: "quarter", label: "Квартал" },
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

  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isFetching: isCategoryFetching,
    isError: isCategoryError,
    refetch: refetchCategory,
  } = useGetExpensesByCategoryQuery(period);
  const {
    data: trendData,
    isLoading: isTrendLoading,
    isFetching: isTrendFetching,
    isError: isTrendError,
    refetch: refetchTrend,
  } = useGetExpensesTrendQuery(period);
  const {
    data: weekdayData,
    isLoading: isWeekdayLoading,
    isFetching: isWeekdayFetching,
    isError: isWeekdayError,
    refetch: refetchWeekday,
  } = useGetExpensesByWeekdayQuery(period);
  const isRefreshing =
    (isCategoryFetching || isTrendFetching || isWeekdayFetching) &&
    !(isCategoryLoading || isTrendLoading || isWeekdayLoading);

  return (
    <div className="space-y-4 lg:space-y-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="flex flex-col">
            <Typography tag="h1" variant="title">
              Аналитика
            </Typography>
            <Typography tag="p" className="text-muted-foreground text-sm">
              Период: {PERIOD_DESCRIPTION_MAP[period]}
            </Typography>
            <Typography
              tag="p"
              aria-live="polite"
              className="h-4 text-xs font-medium"
            >
              <span
                className={`transition-opacity ${
                  isRefreshing
                    ? "text-muted-foreground/80 opacity-100"
                    : "opacity-0"
                }`}
              >
                Обновляем данные...
              </span>
            </Typography>
          </div>
        </div>
        <div className="bg-muted inline-flex w-full gap-1 rounded-lg p-1 lg:w-auto">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              data-active={period === option.value}
              className="data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <CategoryPieCard
          data={categoryData}
          isLoading={isCategoryLoading}
          isError={isCategoryError}
          onRetry={() => {
            void refetchCategory();
          }}
        />
        <WeekdayExpensesCard
          data={weekdayData}
          isLoading={isWeekdayLoading}
          isError={isWeekdayError}
          onRetry={() => {
            void refetchWeekday();
          }}
        />
      </section>

      <section>
        <ExpensesTrendCard
          data={trendData}
          isLoading={isTrendLoading}
          isError={isTrendError}
          onRetry={() => {
            void refetchTrend();
          }}
        />
      </section>
    </div>
  );
};

export { Analytic };
