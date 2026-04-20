import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Typography } from "@/components/ui/typography";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
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
};

const DashboardCashflowCard = ({
  data,
}: {
  data: CashflowPoint[];
}) => (
  <Card className="gap-4 py-5">
    <CardHeader className="px-5">
      <CardTitle>Cashflow за 6 месяцев</CardTitle>
      <Typography tag="p" className="text-muted-foreground text-sm">
        Доходы, расходы и чистый баланс по месяцам
      </Typography>
    </CardHeader>
    <CardContent className="px-5 pt-0">
      {data.length === 0 ? (
        <DashboardEmptyChartState text="Нет данных для cashflow." />
      ) : (
        <div className="h-[300px]">
          <ChartContainer config={DASHBOARD_CHART_CONFIG} className="h-full w-full">
            <ComposedChart data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
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
                          {dashboardCurrencyFormatter.format(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="income" fill="var(--color-income)" radius={6} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={6} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--color-balance)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      )}
    </CardContent>
  </Card>
);

export { DashboardCashflowCard };
