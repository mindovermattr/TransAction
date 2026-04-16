import type { ExpensesByCategoryResponse } from "@/api/requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { EmptyState } from "./empty-state-placeholder";
import type { ChartProps } from "./types";

const CATEGORY_LABELS: Record<TransactionTags, string> = {
  FOOD: "Еда",
  HOUSING: "Жильё",
  TRANSPORT: "Транспорт",
  EDUCATION: "Обучение",
  JOY: "Досуг",
  OTHER: "Другое",
};

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-primary)",
];

type CategoryPieCardProps = ChartProps<ExpensesByCategoryResponse>;
type CategoryDatum = ExpensesByCategoryResponse["data"][number];

const CategoryPieCard = ({
  data,
  isLoading,
  isError,
  onRetry,
}: CategoryPieCardProps) => {
  const { data: categoryData } = data || {};
  const isMobile = useIsMobile();
  const getCategoryLabel = (tag: unknown) => {
    const key = String(tag) as TransactionTags;
    return CATEGORY_LABELS[key] ?? "Другое";
  };

  const { innerRadius, outerRadius } = useMemo(() => {
    if (isMobile) {
      return { innerRadius: 30, outerRadius: 70 };
    }
    return { innerRadius: 50, outerRadius: 110 };
  }, [isMobile]);

  if (isLoading) {
    return (
      <Card className="flex h-full min-h-[420px] flex-col">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-full min-h-[220px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex h-full min-h-[420px] flex-col">
        <CardHeader className="space-y-1">
          <CardTitle>Расходы по категориям</CardTitle>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Показывает структуру трат за выбранный период.
          </Typography>
        </CardHeader>
        <CardContent className="flex flex-1">
          <EmptyState
            variant="error"
            message="Не удалось загрузить данные по категориям"
            description="Проверьте соединение и попробуйте обновить карточку."
            actionLabel="Повторить"
            onAction={onRetry}
            className="min-h-[280px] w-full"
          />
        </CardContent>
      </Card>
    );
  }

  const chartConfig: ChartConfig = Object.entries(CATEGORY_LABELS).reduce(
    (acc, [key, label], index) => {
      acc[key] = {
        label,
        color: COLORS[index % COLORS.length],
      };
      return acc;
    },
    {} as ChartConfig,
  );

  const totalAmount = (categoryData ?? []).reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const topCategory = (categoryData ?? []).reduce<CategoryDatum | null>(
    (acc, item) => {
    if (!acc || item.total > acc.total) {
      return item;
    }
    return acc;
    },
    null,
  );

  return (
    <Card className="flex h-full min-h-[420px] flex-col">
      <CardHeader className="space-y-1">
        <CardTitle>Расходы по категориям</CardTitle>
        <Typography tag="p" className="text-muted-foreground text-sm">
          Показывает структуру трат за выбранный период.
        </Typography>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {!categoryData || categoryData.length === 0 ? (
          <EmptyState
            message="Нет данных по категориям за выбранный период"
            description="Добавьте расходы, чтобы увидеть распределение трат."
            className="min-h-[280px] w-full"
          />
        ) : (
          <>
            <div className="border-border/60 grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
              <div>
                <Typography tag="p" className="text-muted-foreground text-xs">
                  Всего расходов
                </Typography>
                <Typography tag="p" className="text-lg font-semibold">
                  {totalAmount.toLocaleString("ru-RU")} ₽
                </Typography>
              </div>
              <div>
                <Typography tag="p" className="text-muted-foreground text-xs">
                  Лидирующая категория
                </Typography>
                <Typography tag="p" className="text-lg font-semibold">
                  {topCategory ? getCategoryLabel(topCategory.tag) : "—"}
                </Typography>
                <Typography tag="p" className="text-muted-foreground text-sm">
                  {(topCategory?.total ?? 0).toLocaleString("ru-RU")} ₽
                </Typography>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <ChartContainer
                config={chartConfig}
                className="[&_.recharts-pie-label-text]:fill-foreground h-full w-full pb-0 [&_.recharts-pie-label-text]:text-xs sm:[&_.recharts-pie-label-text]:text-sm"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                          <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
                            <span className="text-muted-foreground text-xs sm:text-sm">
                              {getCategoryLabel(name)}
                            </span>
                            <span className="text-xs font-medium sm:text-sm">
                              {Number(value).toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="tag"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={0}
                    labelLine={false}
                    minAngle={12}
                    label={
                      isMobile
                        ? false
                        : ({ value, percent }) => {
                            if (percent < 0.08) return null;
                            return `${Math.round(value as number).toLocaleString("ru-RU")} ₽`;
                          }
                    }
                  >
                    {categoryData.map((item) => (
                      <Cell key={item.tag} fill={`var(--color-${item.tag})`} />
                    ))}
                  </Pie>
                  <ChartLegend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                    content={<ChartLegendContent nameKey="tag" />}
                  />
                </PieChart>
              </ChartContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export { CategoryPieCard };
