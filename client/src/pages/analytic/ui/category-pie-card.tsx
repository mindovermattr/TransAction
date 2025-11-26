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
import { Cell, Pie, PieChart } from "recharts";
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
    <Card className="">
      <CardHeader className="space-y-1">
        <CardTitle>Расходы по категориям</CardTitle>
        <Typography tag="p" className="text-muted-foreground text-sm">
          Показывает распределение расходов за выбранный период.
        </Typography>
      </CardHeader>
      <CardContent className="h-full">
        {!data || data.data.length === 0 ? (
          <Typography tag="p" className="text-muted-foreground text-sm">
            За выбранный период расходы не найдены.
          </Typography>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[280px] w-full max-w-[320px] pb-0"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {CATEGORY_LABELS[name as TransactionTags]}
                        </span>
                        <span className="font-medium">
                          {Number(value).toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={data.data}
                dataKey="total"
                nameKey="tag"
                innerRadius={50}
                outerRadius={110}
                paddingAngle={0}
                labelLine={false}
                minAngle={12}
                label={({ value }) =>
                  `${Math.round(value as number).toLocaleString("ru-RU")} ₽`
                }
              >
                {data.data.map((item) => (
                  <Cell
                    key={item.tag}
                    fill={`var(--color-${item.tag})`}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <ChartLegend
                verticalAlign="bottom"
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
