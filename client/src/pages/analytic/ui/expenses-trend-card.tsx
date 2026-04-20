import type { ExpenseTrendResponse } from "@/api/requests";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useMemo, useState } from "react";
import { Area, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { AnalyticsCardShell } from "./analytics-card-shell";
import { EmptyState } from "./empty-state-placeholder";
import type { ChartProps } from "./types";

type ExpensesTrendCardProps = ChartProps<ExpenseTrendResponse>;

const MOVING_AVERAGE_WINDOW = 4;

const chartConfig: ChartConfig = {
  total: {
    label: "Факт",
    color: "var(--color-chart-1)",
  },
  average: {
    label: "Среднее",
    color: "var(--color-chart-3)",
  },
};

const ExpensesTrendCard = ({
  data,
  isInitialLoading,
  isRefreshing,
  isError,
  onRetry,
}: ExpensesTrendCardProps) => {
  const [activeMetric, setActiveMetric] =
    useState<keyof typeof chartConfig>("total");

  const chartPoints = useMemo(() => {
    if (!data?.points) return [];

    return data.points.map((point, index, arr) => {
      const start = Math.max(0, index - (MOVING_AVERAGE_WINDOW - 1));
      const slice = arr.slice(start, index + 1);
      const average =
        slice.reduce((total, current) => total + current.total, 0) /
        slice.length;

      return {
        ...point,
        average,
      };
    });
  }, [data?.points]);

  const totals = useMemo(() => {
    if (!data?.points || data.points.length === 0) {
      return { total: 0, average: 0 };
    }

    const total = data.points.reduce((sum, point) => sum + point.total, 0);

    return {
      total,
      average: total / data.points.length,
    };
  }, [data?.points]);

  return (
    <AnalyticsCardShell
      title="Динамика расходов"
      subtitle="Главный тренд периода"
      className="min-h-[400px]"
      isInitialLoading={isInitialLoading}
      isRefreshing={isRefreshing}
      isError={isError}
      isEmpty={!data || data.points.length === 0}
      loadingContent={
        <div className="bg-card flex min-h-[400px] flex-col rounded-xl border p-6">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="mt-2 h-4 w-44" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="mt-3 h-9 w-full sm:w-72" />
          <Skeleton className="mt-3 h-[280px] w-full" />
        </div>
      }
      summary={
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="bg-muted/50 rounded-md p-2.5">
            <Typography tag="p" className="text-muted-foreground text-[11px]">
              Сумма расходов
            </Typography>
            <Typography tag="p" className="text-xl font-semibold">
              {totals.total.toLocaleString("ru-RU")} ₽
            </Typography>
          </div>
          <div className="bg-muted/50 rounded-md p-2.5">
            <Typography tag="p" className="text-muted-foreground text-[11px]">
              Среднее за точку
            </Typography>
            <Typography tag="p" className="text-xl font-semibold">
              {Math.round(totals.average).toLocaleString("ru-RU")} ₽
            </Typography>
          </div>
        </div>
      }
      actions={
        <div className="bg-muted inline-flex gap-1 rounded-md p-1">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(
            (metricKey) => (
              <button
                key={metricKey}
                type="button"
                onClick={() => setActiveMetric(metricKey)}
                data-active={activeMetric === metricKey}
                className="data-[active=true]:bg-background data-[active=true]:text-foreground text-muted-foreground rounded px-2.5 py-1 text-xs font-semibold transition-colors"
              >
                {chartConfig[metricKey].label}
              </button>
            ),
          )}
        </div>
      }
      errorContent={
        <EmptyState
          variant="error"
          message="Не удалось загрузить динамику"
          description="Проверьте соединение и повторите попытку."
          actionLabel="Повторить"
          onAction={onRetry}
          className="h-full"
        />
      }
      emptyContent={
        <EmptyState
          message="Нет данных по динамике"
          description="Добавьте расходы, чтобы увидеть изменение трат по времени."
          className="h-full"
        />
      }
      contentClassName="pt-0"
    >
      <div className="h-[280px] w-full lg:h-[320px]">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartPoints}
            margin={{ left: 8, right: 8 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey={activeMetric}
              fill={`var(--color-${activeMetric})`}
              fillOpacity={0.12}
              strokeOpacity={0}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                Intl.NumberFormat("ru-RU", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  className="w-[170px]"
                  labelFormatter={(value) => value}
                  formatter={(value) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-muted-foreground text-xs">
                        {chartConfig[activeMetric].label}
                      </span>
                      <span className="text-xs font-medium">
                        {Number(value).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Line
              type="monotone"
              dataKey={activeMetric}
              stroke={`var(--color-${activeMetric})`}
              strokeWidth={2.25}
              dot={chartPoints.length <= 10}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </AnalyticsCardShell>
  );
};

export { ExpensesTrendCard };
