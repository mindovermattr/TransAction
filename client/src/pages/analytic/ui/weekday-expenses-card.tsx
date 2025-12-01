import type { ExpensesByWeekdayResponse } from "@/api/requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { EmptyState } from "./empty-state";
import type { ChartProps } from "./types";

type WeekdayExpensesCardProps = ChartProps<ExpensesByWeekdayResponse>;

const formatRangeDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));

const WeekdayExpensesCard = ({ data, isLoading }: WeekdayExpensesCardProps) => {
  if (isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (!data || data.data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="space-y-1">
          <CardTitle>Расходы по дням недели</CardTitle>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Где тратите больше всего в течение недели.
          </Typography>
        </CardHeader>
        <CardContent className="flex-1">
          <EmptyState
            message="В выбранный период расходы не найдены"
            description="Добавьте транзакции, чтобы увидеть распределение расходов по дням недели"
            className="min-h-[280px]"
          />
        </CardContent>
      </Card>
    );
  }

  const chartData = [...data.data].sort((a, b) => a.weekday - b.weekday);

  const topDay = chartData.reduce((acc, item) => {
    if (!acc || item.total > acc.total) {
      return item;
    }
    return acc;
  }, chartData[0]);

  const totalWeek = chartData.reduce((sum, item) => sum + item.total, 0);

  const chartConfig: ChartConfig = {
    total: {
      label: "Расходы",
      color: "hsl(262, 83%, 65%)",
    },
  };

  const BAR_HEIGHT = 19;
  const BAR_GAP = 18;
  const chartHeight = chartData.length * (BAR_HEIGHT + BAR_GAP);

  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-1">
        <CardTitle>Расходы по дням недели</CardTitle>
        <Typography tag="p" className="text-muted-foreground text-sm">
          Где тратите больше всего в течение недели.
        </Typography>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="border-border/60 grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
          <div>
            <Typography tag="p" className="text-muted-foreground text-xs">
              Самый затратный день
            </Typography>
            <Typography tag="p" className="text-lg font-semibold">
              {topDay?.label ?? "—"}
            </Typography>
            <Typography tag="p" className="text-muted-foreground text-sm">
              {(topDay?.total ?? 0).toLocaleString("ru-RU")} ₽
            </Typography>
          </div>
          <div>
            <Typography tag="p" className="text-muted-foreground text-xs">
              Суммарно за неделю
            </Typography>
            <Typography tag="p" className="text-lg font-semibold">
              {totalWeek.toLocaleString("ru-RU")} ₽
            </Typography>
            <Typography tag="p" className="text-muted-foreground text-sm">
              {formatRangeDate(data.range.startDate)} —{" "}
              {formatRangeDate(data.range.endDate)}
            </Typography>
          </div>
        </div>
        <div className="flex-1">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full w-full [&_.recharts-bar-rectangle]:opacity-90"
            style={{ minHeight: Math.max(chartHeight, 200) }}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: 0,
                right: 16,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="4 4" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                width={120}
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
                        <span className="text-muted-foreground">
                          {item?.payload.label}
                        </span>
                        <span className="font-medium">
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
        </div>
      </CardContent>
    </Card>
  );
};

export { WeekdayExpensesCard };
