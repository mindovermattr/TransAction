import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { rubCurrencyFormatter } from "@/lib/formatters";

const BudgetSummaryCard = ({ title, value, hint }: { title: string; value: string; hint: string }) => (
  <Card className="gap-3 py-5">
    <CardHeader className="px-5 pb-0">
      <Typography tag="p" className="text-muted-foreground text-xs">
        {title}
      </Typography>
      <CardTitle className="text-2xl">{value}</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pt-0">
      <Typography tag="p" className="text-muted-foreground text-sm">
        {hint}
      </Typography>
    </CardContent>
  </Card>
);

const BudgetSummaryCards = ({ summary }: { summary: BudgetsResponse["summary"] }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <BudgetSummaryCard
      title="Общий бюджет"
      value={rubCurrencyFormatter.format(summary.totalLimit)}
      hint={`${summary.activeCount} активных категорий в работе`}
    />
    <BudgetSummaryCard
      title="Потрачено"
      value={rubCurrencyFormatter.format(summary.totalSpent)}
      hint={`Остаток ${rubCurrencyFormatter.format(summary.totalRemaining)}`}
    />
    <BudgetSummaryCard
      title="Сверх лимита"
      value={String(summary.overCount)}
      hint={summary.warningCount > 0 ? `${summary.warningCount} близко к лимиту` : "Категории с warning появятся здесь"}
    />
  </div>
);

export { BudgetSummaryCards };
