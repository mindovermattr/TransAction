import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Typography } from "@/components/ui/typography";
import { rubCurrencyFormatter } from "@/lib/formatters";
import { Cell, Pie, PieChart } from "recharts";
import { DASHBOARD_CHART_CONFIG } from "../dashboard.constants";
import { formatDashboardCategoryLabel } from "../dashboard.formatters";
import { DashboardEmptyChartState } from "./dashboard-empty-chart-state";

type CategoryPoint = DashboardOverviewResponse["topCategories"][number] & {
  label: string;
  fill: string;
};

const DashboardTopCategoriesCard = ({ data, totalExpenses }: { data: CategoryPoint[]; totalExpenses: number }) => {
  const topCategory = data.reduce<CategoryPoint | null>((currentTop, item) => {
    if (!currentTop || item.total > currentTop.total) {
      return item;
    }

    return currentTop;
  }, null);

  return (
    <Card className="h-full gap-4 py-5">
      <CardHeader className="px-5">
        <CardTitle>Топ категорий</CardTitle>
        <Typography tag="p" className="text-muted-foreground text-sm">
          Структура расходов текущего месяца
        </Typography>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-5 pt-0">
        {data.length === 0 ? (
          <DashboardEmptyChartState text="Нет данных по категориям." />
        ) : (
          <div className="flex h-full flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center pb-5">
              <div className="relative mx-auto aspect-square w-full max-w-[320px] shrink-0">
                <ChartContainer config={DASHBOARD_CHART_CONFIG} className="h-full w-full">
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value, name) => (
                            <div className="flex w-full items-center justify-between gap-3">
                              <span className="text-muted-foreground text-xs">
                                {formatDashboardCategoryLabel(name as TransactionTags)}
                              </span>
                              <span className="text-xs font-medium">{rubCurrencyFormatter.format(Number(value))}</span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Pie
                      data={data}
                      dataKey="total"
                      nameKey="tag"
                      innerRadius={70}
                      outerRadius={108}
                      stroke="var(--card)"
                      strokeWidth={6}
                      paddingAngle={data.length > 1 ? 2 : 0}
                      labelLine={false}
                      label={({ percent }) => {
                        if ((percent ?? 0) < 0.18) return null;
                        return `${Math.round((percent ?? 0) * 100)}%`;
                      }}
                    >
                      {data.map((entry) => (
                        <Cell key={entry.tag} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="bg-background/88 ring-border/70 flex w-[132px] flex-col items-center rounded-full px-4 py-5 text-center shadow-sm ring-1 backdrop-blur-[2px]">
                    <Typography tag="p" className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase">
                      Расходы
                    </Typography>
                    <Typography tag="p" className="mt-2 text-lg leading-none font-semibold">
                      {rubCurrencyFormatter.format(totalExpenses)}
                    </Typography>
                    <Typography tag="p" className="text-muted-foreground mt-1 text-xs">
                      всего за месяц
                    </Typography>
                    <div className="bg-muted/70 mt-3 rounded-full px-2.5 py-1">
                      <Typography tag="p" className="text-[11px] font-medium">
                        Топ: {topCategory?.sharePercent ?? 0}%
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col border-t pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <Typography tag="p" className="text-sm font-medium">
                    Категории месяца
                  </Typography>
                  <Typography tag="p" className="text-muted-foreground text-xs">
                    {topCategory ? `${topCategory.label} лидирует по расходам` : "Распределение по категориям"}
                  </Typography>
                </div>
                <Typography tag="p" className="text-muted-foreground text-xs">
                  {data.length} {data.length === 1 ? "категория" : "категорий"}
                </Typography>
              </div>

              <div className="min-h-0 flex-1">
                <div className="h-full space-y-2 overflow-y-auto pr-1">
                  {data.map((item) => (
                    <div
                      key={item.tag}
                      className="bg-muted/35 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-lg border px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <div className="min-w-0">
                          <Typography tag="p" className="min-w-0 truncate text-sm font-medium">
                            {item.label}
                          </Typography>
                          <Typography tag="p" className="text-muted-foreground text-xs">
                            {item.sharePercent}% всех расходов
                          </Typography>
                        </div>
                      </div>
                      <div className="text-right">
                        <Typography tag="p" className="text-sm font-semibold whitespace-nowrap">
                          {rubCurrencyFormatter.format(item.total)}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { DashboardTopCategoriesCard };
