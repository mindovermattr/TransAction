import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { BUDGET_TAG_LABELS, budgetCompactCurrencyFormatter, budgetCurrencyFormatter, getBudgetStatusBadgeProps } from "../../lib";
import { BudgetProgressBar } from "./budget-progress-bar";

const BudgetMobileList = ({
  budgets,
  onEdit,
  onArchive,
}: {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
}) => (
  <div className="grid gap-3 md:hidden">
    {budgets.map((budget) => {
      const badge = getBudgetStatusBadgeProps(budget.status);
      return (
        <Card key={budget.id} className="gap-4 py-5">
          <CardHeader className="px-5 pb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{BUDGET_TAG_LABELS[budget.tag]}</CardTitle>
                <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                  {budgetCurrencyFormatter.format(budget.spent)} из {budgetCurrencyFormatter.format(budget.limit)}
                </Typography>
              </div>
              <Badge variant="outline" className={badge.className}>
                {badge.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pt-0">
            <BudgetProgressBar progressPercent={budget.progressPercent} status={budget.status} />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted/50 rounded-md p-2.5">
                <Typography tag="p" className="text-muted-foreground text-[11px]">
                  Остаток
                </Typography>
                <Typography
                  tag="p"
                  className={
                    budget.remaining >= 0
                      ? "text-sm font-semibold text-emerald-600 dark:text-emerald-300"
                      : "text-destructive text-sm font-semibold"
                  }
                >
                  {budgetCurrencyFormatter.format(budget.remaining)}
                </Typography>
              </div>
              <div className="bg-muted/50 rounded-md p-2.5">
                <Typography tag="p" className="text-muted-foreground text-[11px]">
                  Факт
                </Typography>
                <Typography tag="p" className="text-sm font-semibold">
                  {budgetCompactCurrencyFormatter.format(budget.spent)}
                </Typography>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onEdit(budget)}>
                <PencilIcon />
                Редактировать
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => onArchive(budget)}>
                <Trash2Icon />
                Архивировать
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

export { BudgetMobileList };
