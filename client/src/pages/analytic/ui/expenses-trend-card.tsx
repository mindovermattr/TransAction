import type { ExpenseTrendResponse } from "@/api/requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { EmptyState } from "./empty-state-placeholder";
import type { ChartProps } from "./types";

type ExpensesTrendCardProps = ChartProps<ExpenseTrendResponse>;

const MOVING_AVERAGE_WINDOW = 4;

const chartConfig: ChartConfig = {
  total: {
    label: "Фактические расходы",
    color: "var(--color-chart-1)",
  },
  average: {
    label: "Скользящее среднее",
    color: "var(--color-chart-3)",
  },
};

const ExpensesTrendCard = ({
  data,
  isLoading,
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
    const average = total / data.points.length;
    return {
      total,
      average,
    };
  }, [data?.points]);

  if (isLoading) {
    return (
      <Card className="flex min-h-[420px] flex-col">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-10 w-full sm:w-96" />
          <Skeleton className="h-full min-h-[220px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex min-h-[420px] flex-col overflow-hidden">
        <CardHeader className="space-y-1 border-b">
          <CardTitle>Динамика расходов</CardTitle>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Переключайтесь между фактическими значениями и сглаженным трендом.
          </Typography>
        </CardHeader>
        <CardContent className="flex flex-1">
          <EmptyState
            variant="error"
            message="Не удалось загрузить динамику расходов"
            description="Проверьте соединение и попробуйте обновить карточку."
            actionLabel="Повторить"
            onAction={onRetry}
            className="h-full w-full"
          />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.points.length === 0) {
    return (
      <Card className="flex min-h-[420px] flex-col overflow-hidden">
        <CardHeader className="space-y-1 border-b">
          <CardTitle>Динамика расходов</CardTitle>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Переключайтесь между фактическими значениями и сглаженным трендом.
          </Typography>
        </CardHeader>
        <CardContent className="flex-1">
          <EmptyState
            message="Нет данных по динамике расходов за выбранный период"
            description="Добавьте расходы, чтобы увидеть тренд изменения трат."
            className="h-full"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-[420px] flex-col overflow-hidden">
      <CardHeader className="flex flex-col gap-4 border-b">
        <div className="flex flex-col gap-1">
          <CardTitle>Динамика расходов</CardTitle>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Переключайтесь между фактическими значениями и сглаженным трендом.
          </Typography>
        </div>
        <div className="border-border/60 grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(
            (metricKey) => (
              <div
                key={metricKey}
                className="flex flex-col gap-1"
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[metricKey].label}
                </span>
                <span className="text-lg leading-none font-semibold">
                  {totals[metricKey as keyof typeof totals].toLocaleString(
                    "ru-RU",
                  )}{" "}
                  ₽
                </span>
              </div>
            ),
          )}
        </div>
        <div className="bg-muted inline-flex w-full gap-1 rounded-lg p-1 sm:w-fit">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(
            (metricKey) => (
              <button
                key={metricKey}
                type="button"
                onClick={() => setActiveMetric(metricKey)}
                data-active={activeMetric === metricKey}
                className="data-[active=true]:bg-background data-[active=true]:text-foreground text-muted-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {chartConfig[metricKey].label}
              </button>
            ),
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 px-4 py-4 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartPoints}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={64}
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
                  className="w-[160px]"
                  labelFormatter={(value) => value}
                  formatter={(value) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {chartConfig[activeMetric].label}
                      </span>
                      <span className="font-medium">
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
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export { ExpensesTrendCard };
