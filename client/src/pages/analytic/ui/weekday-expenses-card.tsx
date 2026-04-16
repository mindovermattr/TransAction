import type { ExpensesByWeekdayResponse } from "@/api/requests";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { AnalyticsCardShell } from "./analytics-card-shell";
import { EmptyState } from "./empty-state-placeholder";
import type { ChartProps } from "./types";

type WeekdayExpensesCardProps = ChartProps<ExpensesByWeekdayResponse>;

const formatRangeDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));

const BAR_HEIGHT = 16;
const BAR_GAP = 10;

const chartConfig: ChartConfig = {
  total: {
    label: "Расходы",
    color: "var(--color-chart-4)",
  },
};

const WeekdayExpensesCard = ({
  data,
  isInitialLoading,
  isRefreshing,
  isError,
  onRetry,
}: WeekdayExpensesCardProps) => {
  const chartData = [...(data?.data ?? [])].sort((a, b) => a.weekday - b.weekday);
  const chartHeight = chartData.length * (BAR_HEIGHT + BAR_GAP);

  const topDay =
    chartData.length > 0
      ? chartData.reduce((acc, item) => {
          if (!acc || item.total > acc.total) {
            return item;
          }
          return acc;
        }, chartData[0])
      : null;

  const totalWeek = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <AnalyticsCardShell
      title="Дни недели"
      subtitle="Паттерн трат"
      isInitialLoading={isInitialLoading}
      isRefreshing={isRefreshing}
      isError={isError}
      isEmpty={chartData.length === 0}
      loadingContent={
        <div className="flex min-h-[420px] flex-col rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-44" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="mt-3 h-full min-h-[220px] w-full" />
        </div>
      }
      summary={
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="bg-muted/50 rounded-md p-2.5">
            <Typography tag="p" className="text-muted-foreground text-[11px]">
              Пик трат
            </Typography>
            <Typography tag="p" className="text-base font-semibold">
              {topDay?.label ?? "—"}
            </Typography>
            <Typography tag="p" className="text-muted-foreground text-xs">
              {(topDay?.total ?? 0).toLocaleString("ru-RU")} ₽
            </Typography>
          </div>
          <div className="bg-muted/50 rounded-md p-2.5">
            <Typography tag="p" className="text-muted-foreground text-[11px]">
              Сумма за период
            </Typography>
            <Typography tag="p" className="text-base font-semibold">
              {totalWeek.toLocaleString("ru-RU")} ₽
            </Typography>
            {data ? (
              <Typography tag="p" className="text-muted-foreground text-xs">
                {formatRangeDate(data.range.startDate)} —{" "}
                {formatRangeDate(data.range.endDate)}
              </Typography>
            ) : null}
          </div>
        </div>
      }
      errorContent={
        <EmptyState
          variant="error"
          message="Не удалось загрузить дни недели"
          description="Проверьте соединение и повторите попытку."
          actionLabel="Повторить"
          onAction={onRetry}
          className="min-h-[280px]"
        />
      }
      emptyContent={
        <EmptyState
          message="Нет данных по дням недели"
          description="Добавьте расходы, чтобы увидеть недельный профиль."
          className="min-h-[280px]"
        />
      }
      contentClassName="pt-0"
    >
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-full w-full [&_.recharts-bar-rectangle]:opacity-90"
        style={{ minHeight: Math.max(chartHeight, 220) }}
      >
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{
            left: -32,
            right: 14,
            bottom: 10,
          }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="4 4" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="label"
            type="category"
            width={118}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, _name, item) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground text-xs">
                      {item?.payload.label}
                    </span>
                    <span className="text-xs font-medium">
                      {Number(value).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="total"
            fill="var(--color-total)"
            radius={6}
            barSize={BAR_HEIGHT}
          />
        </BarChart>
      </ChartContainer>
    </AnalyticsCardShell>
  );
};

export { WeekdayExpensesCard };
