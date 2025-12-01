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
import { EmptyState } from "./empty-state";
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
  "#6366f1",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#22d3ee",
  "#a855f7",
];

type CategoryPieCardProps = ChartProps<ExpensesByCategoryResponse>;

const CategoryPieCard = ({ data, isLoading }: CategoryPieCardProps) => {
  const { data: categoryData } = data || {};
  const isMobile = useIsMobile();

  const { innerRadius, outerRadius } = useMemo(() => {
    if (isMobile) {
      return { innerRadius: 30, outerRadius: 70 };
    }
    return { innerRadius: 50, outerRadius: 110 };
  }, [isMobile]);

  if (isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
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

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-1">
        <CardTitle>Расходы по категориям</CardTitle>
        <Typography tag="p" className="text-muted-foreground text-sm">
          Показывает распределение расходов за выбранный период.
        </Typography>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        {!categoryData || categoryData.length === 0 ? (
          <EmptyState
            message="В выбранный период расходы не найдены"
            description="Добавьте транзакции, чтобы увидеть распределение по категориям"
            className="min-h-[280px]"
          />
        ) : (
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
                          {CATEGORY_LABELS[name as TransactionTags]}
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
                        // Показываем label только для секторов больше 5%
                        if (percent < 0.05) return null;
                        return `${Math.round(value as number).toLocaleString("ru-RU")} ₽`;
                      }
                }
              >
                {categoryData.map((item) => (
                  <Cell
                    key={item.tag}
                    fill={`var(--color-${item.tag})`}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <ChartLegend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                content={<ChartLegendContent nameKey="tag" />}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export { CategoryPieCard };
