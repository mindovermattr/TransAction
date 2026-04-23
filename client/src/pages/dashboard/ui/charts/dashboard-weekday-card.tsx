import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Typography } from "@/components/ui/typography";
import { rubCurrencyFormatter } from "@/lib/formatters";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DASHBOARD_CHART_CONFIG } from "../dashboard.constants";
import { DashboardEmptyChartState } from "./dashboard-empty-chart-state";

const DashboardWeekdayCard = ({ data }: { data: DashboardOverviewResponse["weekdayTotals"] }) => (
  <Card className="h-full gap-4 py-5">
    <CardHeader className="px-5">
      <CardTitle>Паттерн по дням недели</CardTitle>
      <Typography tag="p" className="text-muted-foreground text-sm">
        Где чаще всего сосредоточены траты в этом месяце
      </Typography>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col px-5 pt-0">
      {data.length === 0 ? (
        <DashboardEmptyChartState text="Нет данных по дням недели." />
      ) : (
        <div className="min-h-[280px] flex-1">
          <ChartContainer config={DASHBOARD_CHART_CONFIG} className="aspect-auto h-full w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="4 4" />
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={110} tickLine={false} axisLine={false} interval={0} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, item) => (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground text-xs">{item?.payload.label}</span>
                        <span className="text-xs font-medium">{rubCurrencyFormatter.format(Number(value))}</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={6} />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </CardContent>
  </Card>
);

export { DashboardWeekdayCard };
