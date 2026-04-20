import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Typography } from "@/components/ui/typography";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  DASHBOARD_CHART_CONFIG,
} from "../dashboard.constants";
import {
  dashboardCompactFormatter,
  dashboardCurrencyFormatter,
} from "../dashboard.formatters";

type PeriodComparePoint = {
  label: string;
  total: number;
  fill: string;
};

const DashboardPeriodCompareCard = ({
  data,
}: {
  data: PeriodComparePoint[];
}) => (
  <Card className="gap-4 py-5">
    <CardHeader className="px-5">
      <CardTitle>Доходы vs расходы</CardTitle>
      <Typography tag="p" className="text-muted-foreground text-sm">
        Сравнение текущего месяца
      </Typography>
    </CardHeader>
    <CardContent className="px-5 pt-0">
      <div className="h-[220px]">
        <ChartContainer config={DASHBOARD_CHART_CONFIG} className="h-full w-full">
          <BarChart data={data} margin={{ left: 0, right: 0 }}>
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
                  hideLabel
                  formatter={(value, _name, item) => (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-muted-foreground text-xs">
                        {item?.payload.label}
                      </span>
                      <span className="text-xs font-medium">
                        {dashboardCurrencyFormatter.format(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="total" radius={8}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </CardContent>
  </Card>
);

export { DashboardPeriodCompareCard };
