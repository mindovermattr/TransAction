import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { dashboardCurrencyFormatter } from "../dashboard.formatters";
import { DashboardEmptyChartState } from "./dashboard-empty-chart-state";

type PeriodComparePoint = {
  label: string;
  total: number;
  fill: string;
};

const DashboardPeriodCompareCard = ({ data }: { data: PeriodComparePoint[] }) => {
  const income = data.find((item) => item.label === "Доходы")?.total ?? 0;
  const expenses = data.find((item) => item.label === "Расходы")?.total ?? 0;
  const maxValue = Math.max(income, expenses);
  const incomeWidth = maxValue === 0 ? 0 : (income / maxValue) * 100;
  const expensesWidth = maxValue === 0 ? 0 : (expenses / maxValue) * 100;
  const net = income - expenses;
  const netLabel = net >= 0 ? "Профицит" : "Дефицит";

  return (
    <Card className="h-full gap-4 py-5">
      <CardHeader className="px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Доходы vs расходы</CardTitle>
            <Typography tag="p" className="text-muted-foreground text-sm">
              Сравнение текущего месяца
            </Typography>
          </div>
          <Badge variant="outline" className={cn("rounded-full px-3 py-1", net === 0 && "bg-muted/70")}>
            {netLabel}: {dashboardCurrencyFormatter.format(Math.abs(net))}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-5 pt-0">
        {maxValue === 0 ? (
          <DashboardEmptyChartState text="Нет данных для сравнения доходов и расходов." />
        ) : (
          <div className="flex h-full flex-1 flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-muted/25 flex h-full flex-col rounded-2xl border p-4">
                <Typography tag="p" className="text-muted-foreground text-sm">
                  Доходы
                </Typography>
                <Typography tag="p" className="mt-2 text-2xl font-semibold tracking-tight">
                  {dashboardCurrencyFormatter.format(income)}
                </Typography>
                <Typography tag="p" className="text-muted-foreground mt-auto pt-3 text-xs font-medium">
                  {incomeWidth.toFixed(0)}% от ведущего показателя
                </Typography>
              </div>

              <div className="bg-muted/25 flex h-full flex-col rounded-2xl border p-4">
                <Typography tag="p" className="text-muted-foreground text-sm">
                  Расходы
                </Typography>
                <Typography tag="p" className="mt-2 text-2xl font-semibold tracking-tight">
                  {dashboardCurrencyFormatter.format(expenses)}
                </Typography>
                <Typography tag="p" className="text-muted-foreground mt-auto pt-3 text-xs font-medium">
                  {expensesWidth.toFixed(0)}% от ведущего показателя
                </Typography>
              </div>
            </div>

            <div className="bg-muted/35 flex flex-1 flex-col rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <Typography tag="p" className="text-sm font-medium">
                  Соотношение месяца
                </Typography>
                <Typography tag="p" className="text-muted-foreground text-xs">
                  Нормализация по большему значению
                </Typography>
              </div>

              <div className="mt-4 flex flex-1 flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">Доходы</span>
                    <span className="text-muted-foreground">{dashboardCurrencyFormatter.format(income)}</span>
                  </div>
                  <div className="bg-background h-3 overflow-hidden rounded-full border">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 dark:bg-emerald-400"
                      style={{ width: `${incomeWidth}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">Расходы</span>
                    <span className="text-muted-foreground">{dashboardCurrencyFormatter.format(expenses)}</span>
                  </div>
                  <div className="bg-background h-3 overflow-hidden rounded-full border">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-[width] duration-300 dark:bg-rose-400"
                      style={{ width: `${expensesWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { DashboardPeriodCompareCard };
