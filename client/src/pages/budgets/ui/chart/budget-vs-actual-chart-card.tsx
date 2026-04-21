import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import {
  BUDGET_TAG_LABELS,
  budgetCompactCurrencyFormatter,
  budgetCurrencyFormatter,
  getBudgetProgressBarClassName,
} from "../../lib";

const BudgetVsActualChartCard = ({ items }: { items: Budget[] }) => {
  const chartItems = items.slice(0, 6);
  const leadingBudget = chartItems[0] ?? null;
  const maxSpent = chartItems.reduce((max, item) => Math.max(max, item.spent, item.limit), 0);

  return (
    <Card className="h-full gap-4 py-5">
      <CardHeader className="px-5 pb-0">
        <CardTitle>Budget vs Actual</CardTitle>
        <Typography tag="p" className="text-muted-foreground text-sm">
          Где лимит уже съеден, а где еще есть запас
        </Typography>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-5 pt-0">
        {chartItems.length === 0 ? (
          <div className="border-border/70 text-muted-foreground flex min-h-[280px] flex-1 items-center justify-center rounded-lg border border-dashed text-sm">
            Нет данных для графика.
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-muted/45 rounded-lg border p-3">
                <Typography tag="p" className="text-muted-foreground text-[11px] uppercase tracking-[0.16em]">
                  Самое узкое место
                </Typography>
                <Typography tag="p" className="mt-1 text-base font-semibold">
                  {leadingBudget ? BUDGET_TAG_LABELS[leadingBudget.tag] : "—"}
                </Typography>
                <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                  {leadingBudget
                    ? leadingBudget.remaining >= 0
                      ? `Остаток ${budgetCurrencyFormatter.format(leadingBudget.remaining)}`
                      : `Перерасход ${budgetCurrencyFormatter.format(Math.abs(leadingBudget.remaining))}`
                    : "Нет данных"}
                </Typography>
              </div>
              <div className="bg-muted/45 rounded-lg border p-3">
                <Typography tag="p" className="text-muted-foreground text-[11px] uppercase tracking-[0.16em]">
                  Срез по категориям
                </Typography>
                <Typography tag="p" className="mt-1 text-base font-semibold">
                  {chartItems.length} в фокусе
                </Typography>
                <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                  Сначала проблемные, потом стабильные категории
                </Typography>
              </div>
            </div>

            <div className="space-y-3">
              {chartItems.map((item) => {
                const limitWidth = maxSpent > 0 ? (item.limit / maxSpent) * 100 : 0;
                const spentWidth = maxSpent > 0 ? (item.spent / maxSpent) * 100 : 0;

                return (
                  <div key={item.id} className="space-y-2 rounded-lg border border-border/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Typography tag="p" className="truncate font-medium">
                          {BUDGET_TAG_LABELS[item.tag]}
                        </Typography>
                        <Typography tag="p" className="text-muted-foreground text-xs">
                          {budgetCurrencyFormatter.format(item.spent)} из {budgetCurrencyFormatter.format(item.limit)}
                        </Typography>
                      </div>
                      <Typography
                        tag="p"
                        className={
                          item.remaining >= 0
                            ? "text-xs font-medium text-emerald-600 dark:text-emerald-300"
                            : "text-destructive text-xs font-medium"
                        }
                      >
                        {item.remaining >= 0
                          ? `+${budgetCurrencyFormatter.format(item.remaining)}`
                          : `-${budgetCurrencyFormatter.format(Math.abs(item.remaining))}`}
                      </Typography>
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                          <span>Лимит</span>
                          <span>{budgetCompactCurrencyFormatter.format(item.limit)}</span>
                        </div>
                        <div className="bg-muted h-2 rounded-full">
                          <div
                            className="h-full rounded-full bg-[var(--color-chart-2)]"
                            style={{ width: `${limitWidth}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                          <span>Факт</span>
                          <span>{budgetCompactCurrencyFormatter.format(item.spent)}</span>
                        </div>
                        <div className="bg-muted h-2.5 rounded-full">
                          <div
                            className={`h-full rounded-full ${getBudgetProgressBarClassName(item.status)}`}
                            style={{ width: `${Math.min(spentWidth, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export { BudgetVsActualChartCard };
