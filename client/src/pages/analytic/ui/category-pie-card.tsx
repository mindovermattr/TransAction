import type { ExpensesByCategoryResponse } from "@/api/requests";
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
import { AnalyticsCardShell } from "./analytics-card-shell";
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
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-1)",
  "var(--color-primary)",
];

type CategoryPieCardProps = ChartProps<ExpensesByCategoryResponse>;
type CategoryDatum = ExpensesByCategoryResponse["data"][number];

const CategoryPieCard = ({
  data,
  isInitialLoading,
  isRefreshing,
  isError,
  onRetry,
}: CategoryPieCardProps) => {
  const categoryData = data?.data ?? [];
  const isMobile = useIsMobile();

  const getCategoryLabel = (tag: unknown) => {
    const key = String(tag) as TransactionTags;
    return CATEGORY_LABELS[key] ?? "Другое";
  };

  const { innerRadius, outerRadius } = useMemo(() => {
    if (isMobile) {
      return { innerRadius: 34, outerRadius: 74 };
    }
    return { innerRadius: 56, outerRadius: 114 };
  }, [isMobile]);

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

  const totalAmount = categoryData.reduce((sum, item) => sum + item.total, 0);
  const topCategory = categoryData.reduce<CategoryDatum | null>((acc, item) => {
    if (!acc || item.total > acc.total) {
      return item;
    }
    return acc;
  }, null);
  const topCategoryShare =
    topCategory && totalAmount > 0
      ? Math.round((topCategory.total / totalAmount) * 100)
      : 0;

  return (
    <AnalyticsCardShell
      title="Категории"
      subtitle="Структура расходов"
      isInitialLoading={isInitialLoading}
      isRefreshing={isRefreshing}
      isError={isError}
      isEmpty={categoryData.length === 0}
      loadingContent={
        <div className="flex min-h-[420px] flex-col rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-36" />
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
              Всего
            </Typography>
            <Typography tag="p" className="text-base font-semibold">
              {totalAmount.toLocaleString("ru-RU")} ₽
            </Typography>
          </div>
          <div className="bg-muted/50 rounded-md p-2.5">
            <Typography tag="p" className="text-muted-foreground text-[11px]">
              Топ категория
            </Typography>
            <Typography tag="p" className="text-base font-semibold">
              {topCategory ? getCategoryLabel(topCategory.tag) : "—"}
            </Typography>
            <Typography tag="p" className="text-muted-foreground text-xs">
              {topCategoryShare}% от периода
            </Typography>
          </div>
        </div>
      }
      errorContent={
        <EmptyState
          variant="error"
          message="Не удалось загрузить категории"
          description="Проверьте соединение и повторите попытку."
          actionLabel="Повторить"
          onAction={onRetry}
          className="min-h-[280px]"
        />
      }
      emptyContent={
        <EmptyState
          message="Нет данных по категориям"
          description="Добавьте расходы, чтобы увидеть breakdown."
          className="min-h-[280px]"
        />
      }
      contentClassName="pt-0"
    >
      <ChartContainer
        config={chartConfig}
        className="[&_.recharts-pie-label-text]:fill-foreground h-full w-full pb-0 [&_.recharts-pie-label-text]:text-xs"
      >
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground text-xs">
                      {getCategoryLabel(name)}
                    </span>
                    <span className="text-xs font-medium">
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
            labelLine={false}
            minAngle={10}
            label={
              isMobile
                ? false
                : ({ percent }) => {
                    if ((percent ?? 0) < 0.12) return null;
                    return `${Math.round((percent ?? 0) * 100)}%`;
                  }
            }
          >
            {categoryData.map((item) => (
              <Cell key={item.tag} fill={`var(--color-${item.tag})`} />
            ))}
          </Pie>
          <ChartLegend
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: isMobile ? "10px" : "11px" }}
            content={<ChartLegendContent nameKey="tag" />}
          />
        </PieChart>
      </ChartContainer>
    </AnalyticsCardShell>
  );
};

export { CategoryPieCard };
