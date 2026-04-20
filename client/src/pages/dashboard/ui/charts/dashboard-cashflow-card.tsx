import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Typography } from "@/components/ui/typography";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  DASHBOARD_CHART_CONFIG,
} from "../dashboard.constants";
import {
  dashboardCompactFormatter,
  dashboardCurrencyFormatter,
} from "../dashboard.formatters";
import { DashboardEmptyChartState } from "./dashboard-empty-chart-state";

type CashflowPoint = DashboardOverviewResponse["cashflow"]["months"][number] & {
  label: string;
  signedExpenses: number;
};

const CashflowSparseState = ({ data }: { data: CashflowPoint[] }) => (
  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
    {data.map((item) => (
      <div key={item.monthStart} className="bg-muted/35 rounded-lg border p-3">
        <Typography tag="p" className="text-muted-foreground text-xs">
          {item.label}
        </Typography>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-xs">Доходы</span>
            <span className="text-xs font-medium">
              {dashboardCurrencyFormatter.format(item.income)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-xs">Расходы</span>
            <span className="text-xs font-medium">
              {dashboardCurrencyFormatter.format(item.expenses)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-1.5">
            <span className="text-muted-foreground text-xs">Баланс</span>
            <span className="text-xs font-semibold">
              {dashboardCurrencyFormatter.format(item.balance)}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const DashboardCashflowCard = ({
  data,
}: {
  data: CashflowPoint[];
}) => {
  const activeMonths = data.filter(
    (item) => item.income !== 0 || item.expenses !== 0 || item.balance !== 0,
  );
  const isSparse = activeMonths.length <= 2;

  return (
    <Card className="h-full gap-4 py-5">
      <CardHeader className="px-5">
        <CardTitle>Cashflow за 6 месяцев</CardTitle>
        <Typography tag="p" className="text-muted-foreground text-sm">
          Доходы, расходы и чистый баланс по месяцам
        </Typography>
      </CardHeader>
      <CardContent className="px-5 pt-0">
        {data.length === 0 ? (
          <DashboardEmptyChartState text="Нет данных для cashflow." />
        ) : isSparse ? (
          <CashflowSparseState data={data} />
        ) : (
          <div className="h-[240px]">
            <ChartContainer config={DASHBOARD_CHART_CONFIG} className="h-full w-full">
              <LineChart data={data} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tickFormatter={(value) => dashboardCompactFormatter.format(value)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="text-muted-foreground text-xs">
                            {DASHBOARD_CHART_CONFIG[String(name)]?.label ?? name}
                          </span>
                          <span className="text-xs font-medium">
                            {dashboardCurrencyFormatter.format(
                              String(name) === "signedExpenses"
                                ? Math.abs(Number(value))
                                : Number(value),
                            )}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-income)"
                  strokeWidth={1.75}
                  dot={data.length <= 6 ? { r: 2.5 } : false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  dataKey="signedExpenses"
                  type="monotone"
                  stroke="var(--color-signedExpenses)"
                  strokeWidth={1.75}
                  strokeDasharray="6 4"
                  dot={data.length <= 6 ? { r: 2.5 } : false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--color-balance)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { DashboardCashflowCard };
