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
import { EmptyState } from "./empty-state";
import type { ChartProps } from "./types";

type ExpensesTrendCardProps = ChartProps<ExpenseTrendResponse>;

const MOVING_AVERAGE_WINDOW = 4;

const chartConfig: ChartConfig = {
  total: {
    label: "Фактические расходы",
    color: "hsl(242, 77%, 65%)",
  },
  average: {
    label: "Скользящее среднее",
    color: "hsl(214, 83%, 55%)",
  },
};

const ExpensesTrendCard = ({ data, isLoading }: ExpensesTrendCardProps) => {
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
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (!data || data.points.length === 0) {
    return (
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="space-y-1 border-b">
          <CardTitle>Динамика расходов</CardTitle>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Переключайтесь между фактическими значениями и скользящим средним.
          </Typography>
        </CardHeader>
        <CardContent className="flex-1">
          <EmptyState
            message="В выбранный период расходы не найдены"
            description="Добавьте транзакции, чтобы увидеть динамику расходов"
            className="h-full"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-[500px] flex-col overflow-hidden py-4 sm:h-[360px] sm:py-0">
      <CardHeader className="flex flex-col gap-4 border-b px-6 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-0 sm:pb-0 sm:pl-6">
        <div className="flex flex-col gap-1">
          <CardTitle>Динамика расходов</CardTitle>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Переключайтесь между фактическими значениями и скользящим средним.
          </Typography>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-0">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(
            (metricKey) => (
              <button
                key={metricKey}
                type="button"
                onClick={() => setActiveMetric(metricKey)}
                data-active={activeMetric === metricKey}
                className="data-[active=true]:bg-muted/70 hover:bg-muted/70 flex flex-1 cursor-pointer flex-col justify-center gap-1 border border-t px-4 py-3 text-left text-sm transition-colors first:rounded-t-md first:border-l last:rounded-b-md sm:rounded-none sm:border sm:border-t sm:border-b sm:border-l-0 sm:px-6 sm:py-4 sm:text-base sm:first:rounded-t-none sm:first:rounded-l-md sm:last:rounded-r-md sm:last:rounded-b-none"
              >
                <span className="text-muted-foreground text-xs sm:text-sm">
                  {chartConfig[metricKey].label}
                </span>
                <span className="text-lg leading-none font-semibold sm:text-2xl">
                  {totals[metricKey as keyof typeof totals].toLocaleString(
                    "ru-RU",
                  )}{" "}
                  ₽
                </span>
              </button>
            ),
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 sm:p-6">
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
