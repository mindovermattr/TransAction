import { useGetExpensesByWeekdayQuery } from "@/api/hooks";
import { useGetBalanceOverviewQuery } from "@/api/hooks/expenses/useGetBalanceOverviewQuery";
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

const formatPeakDateLabel = (
  value: string | undefined,
  granularity: "day" | "week" | "month" | undefined,
) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (granularity === "day") {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  if (granularity === "week") {
    return `Неделя от ${new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)}`;
  }

  const monthLabel = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);

  return monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
};

const Analytic = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    isFetching: isBalanceFetching,
    isError: isBalanceError,
    refetch: refetchBalance,
  } = useGetBalanceOverviewQuery(period);

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
  const isBalanceRefreshing = isBalanceFetching && !!balanceData;
  const isCategoryRefreshing = isCategoryFetching && !!categoryData;
  const isWeekdayRefreshing = isWeekdayFetching && !!weekdayData;

  const isPageRefreshing =
    isTrendRefreshing ||
    isBalanceRefreshing ||
    isCategoryRefreshing ||
    isWeekdayRefreshing;

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
      peakLabel: formatPeakDateLabel(peak?.date, trendData?.granularity),
      peakValue: peak?.total ?? 0,
    };
  }, [trendData?.points, trendData?.granularity]);

  return (
    <div className="space-y-4 lg:space-y-5">
      <section className="bg-card rounded-xl border p-4 lg:p-5">
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
                  className="data-[active=true]:bg-background data-[active=true]:text-foreground text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-semibold transition-colors data-[active=true]:shadow-xs"
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

        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {isBalanceLoading && !balanceData ? (
            <>
              <Skeleton className="h-[92px] w-full rounded-lg" />
              <Skeleton className="h-[92px] w-full rounded-lg" />
              <Skeleton className="h-[92px] w-full rounded-lg" />
            </>
          ) : isBalanceError && !balanceData ? (
            <div className="bg-muted/45 col-span-full rounded-lg p-3.5">
              <Typography tag="p" className="text-sm">
                Не удалось загрузить баланс.
              </Typography>
              <button
                type="button"
                className="text-primary mt-1 text-sm underline"
                onClick={() => {
                  void refetchBalance();
                }}
              >
                Повторить
              </button>
            </div>
          ) : (
            <>
              <div className="bg-muted/45 rounded-lg p-3.5">
                <Typography tag="p" className="text-muted-foreground text-xs">
                  Доходы за период
                </Typography>
                <Typography tag="p" className="text-2xl font-semibold">
                  {(balanceData?.totals.income ?? 0).toLocaleString("ru-RU")} ₽
                </Typography>
              </div>
              <div className="bg-muted/45 rounded-lg p-3.5">
                <Typography tag="p" className="text-muted-foreground text-xs">
                  Расходы за период
                </Typography>
                <Typography tag="p" className="text-2xl font-semibold">
                  {(balanceData?.totals.expenses ?? 0).toLocaleString("ru-RU")}{" "}
                  ₽
                </Typography>
              </div>
              <div className="bg-muted/45 rounded-lg p-3.5">
                <Typography tag="p" className="text-muted-foreground text-xs">
                  Баланс периода
                </Typography>
                <Typography
                  tag="p"
                  className={`text-2xl font-semibold ${
                    (balanceData?.totals.balance ?? 0) >= 0
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {(balanceData?.totals.balance ?? 0).toLocaleString("ru-RU")} ₽
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
