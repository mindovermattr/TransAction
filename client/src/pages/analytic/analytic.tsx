import { useGetExpensesByWeekdayQuery } from "@/api/hooks";
import { useGetExpensesByCategoryQuery } from "@/api/hooks/expenses/useGetExpensesByCategoryQuery";
import { useGetExpensesTrendQuery } from "@/api/hooks/expenses/useGetExpensesTrendQuery";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { Circle } from "lucide-react";
import { useMemo, useState } from "react";
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

  const isInitialTrendLoading = isTrendLoading && !trendData;
  const isInitialCategoryLoading = isCategoryLoading && !categoryData;
  const isInitialWeekdayLoading = isWeekdayLoading && !weekdayData;

  const isTrendRefreshing = isTrendFetching && !!trendData;
  const isCategoryRefreshing = isCategoryFetching && !!categoryData;
  const isWeekdayRefreshing = isWeekdayFetching && !!weekdayData;

  const isPageRefreshing =
    isTrendRefreshing || isCategoryRefreshing || isWeekdayRefreshing;

  const heroMetrics = useMemo(() => {
    const points = trendData?.points ?? [];
    if (points.length === 0) {
      return {
        total: 0,
        average: 0,
        peakLabel: "—",
        peakValue: 0,
      };
    }

    const total = points.reduce((sum, point) => sum + point.total, 0);
    const average = Math.round(total / points.length);
    const peak = points.reduce((acc, point) => {
      if (!acc || point.total > acc.total) {
        return point;
      }
      return acc;
    }, points[0]);

    return {
      total,
      average,
      peakLabel: peak?.label ?? "—",
      peakValue: peak?.total ?? 0,
    };
  }, [trendData?.points]);

  return (
    <div className="space-y-4 lg:space-y-5">
      <section className="rounded-xl border bg-card p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2.5">
            <SidebarTrigger />
            <div className="space-y-1">
              <Typography tag="h1" variant="title" className="text-2xl">
                Аналитика
              </Typography>
              <Typography tag="p" className="text-muted-foreground text-sm">
                Обзор расходов за {PERIOD_DESCRIPTION_MAP[period]}
              </Typography>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="border-border/60 text-muted-foreground inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium">
              <Circle
                className={`h-2.5 w-2.5 ${
                  isPageRefreshing
                    ? "fill-amber-500 text-amber-500"
                    : "fill-emerald-500 text-emerald-500"
                }`}
              />
              <span className="w-[78px] text-left">
                {isPageRefreshing ? "Обновление" : "Актуально"}
              </span>
            </div>

            <div className="bg-muted inline-flex w-full gap-1 rounded-lg p-1 sm:w-auto">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  data-active={period === option.value}
                  className="data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-semibold transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {isInitialTrendLoading ? (
            <>
              <Skeleton className="h-[92px] w-full rounded-lg" />
              <Skeleton className="h-[92px] w-full rounded-lg" />
              <Skeleton className="h-[92px] w-full rounded-lg" />
            </>
          ) : (
            <>
              <div className="bg-muted/45 rounded-lg p-3.5">
                <Typography tag="p" className="text-muted-foreground text-xs">
                  Сумма расходов
                </Typography>
                <Typography tag="p" className="text-2xl font-semibold">
                  {heroMetrics.total.toLocaleString("ru-RU")} ₽
                </Typography>
              </div>
              <div className="bg-muted/45 rounded-lg p-3.5">
                <Typography tag="p" className="text-muted-foreground text-xs">
                  Среднее за точку
                </Typography>
                <Typography tag="p" className="text-2xl font-semibold">
                  {heroMetrics.average.toLocaleString("ru-RU")} ₽
                </Typography>
              </div>
              <div className="bg-muted/45 rounded-lg p-3.5">
                <Typography tag="p" className="text-muted-foreground text-xs">
                  Пик трат
                </Typography>
                <Typography tag="p" className="text-lg font-semibold">
                  {heroMetrics.peakLabel}
                </Typography>
                <Typography tag="p" className="text-muted-foreground text-sm">
                  {heroMetrics.peakValue.toLocaleString("ru-RU")} ₽
                </Typography>
              </div>
            </>
          )}
        </div>
      </section>

      <section>
        <ExpensesTrendCard
          data={trendData}
          isInitialLoading={isInitialTrendLoading}
          isRefreshing={isTrendRefreshing}
          isError={isTrendError && !trendData}
          onRetry={() => {
            void refetchTrend();
          }}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CategoryPieCard
          data={categoryData}
          isInitialLoading={isInitialCategoryLoading}
          isRefreshing={isCategoryRefreshing}
          isError={isCategoryError && !categoryData}
          onRetry={() => {
            void refetchCategory();
          }}
        />
        <WeekdayExpensesCard
          data={weekdayData}
          isInitialLoading={isInitialWeekdayLoading}
          isRefreshing={isWeekdayRefreshing}
          isError={isWeekdayError && !weekdayData}
          onRetry={() => {
            void refetchWeekday();
          }}
        />
      </section>
    </div>
  );
};

export { Analytic };
