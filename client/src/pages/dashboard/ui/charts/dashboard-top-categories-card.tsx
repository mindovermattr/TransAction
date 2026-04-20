import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Typography } from "@/components/ui/typography";
import { Cell, Pie, PieChart } from "recharts";
import { DASHBOARD_CHART_CONFIG } from "../dashboard.constants";
import {
  dashboardCurrencyFormatter,
  formatDashboardCategoryLabel,
} from "../dashboard.formatters";
import { DashboardEmptyChartState } from "./dashboard-empty-chart-state";

type CategoryPoint = DashboardOverviewResponse["topCategories"][number] & {
  label: string;
  fill: string;
};

const DashboardTopCategoriesCard = ({
  data,
}: {
  data: CategoryPoint[];
}) => (
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
          <div className="flex flex-1 items-center justify-center pb-4">
            <div className="mx-auto h-[180px] w-full max-w-[240px] shrink-0">
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
                          <span className="text-xs font-medium">
                            {dashboardCurrencyFormatter.format(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="tag"
                  innerRadius={42}
                  outerRadius={72}
                >
                  {data.map((entry) => (
                    <Cell key={entry.tag} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Typography tag="p" className="text-sm font-medium">
                Категории месяца
              </Typography>
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
                      <Typography
                        tag="p"
                        className="min-w-0 truncate text-sm font-medium"
                      >
                        {item.label}
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography
                        tag="p"
                        className="text-sm font-semibold whitespace-nowrap"
                      >
                        {dashboardCurrencyFormatter.format(item.total)}
                      </Typography>
                      <Typography tag="p" className="text-muted-foreground text-xs">
                        {item.sharePercent}%
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

export { DashboardTopCategoriesCard };
