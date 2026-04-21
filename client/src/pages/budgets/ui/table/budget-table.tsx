import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { BUDGET_TAG_LABELS, budgetCurrencyFormatter, getBudgetStatusBadgeProps } from "../../lib";
import { BudgetProgressBar } from "./budget-progress-bar";

const BudgetTable = ({
  budgets,
  onEdit,
  onArchive,
}: {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
}) => (
  <Card className="hidden py-5 md:flex">
    <CardHeader className="px-5 pb-0">
      <CardTitle>Категории месяца</CardTitle>
      <Typography tag="p" className="text-muted-foreground text-sm">
        Сначала самые проблемные категории, потом стабильные.
      </Typography>
    </CardHeader>
    <CardContent className="px-5 pt-0">
      <Table className="[&_td]:px-3 [&_td]:py-3 [&_th]:h-9 [&_th]:px-3">
        <TableHeader>
          <TableRow>
            <TableHead>Категория</TableHead>
            <TableHead>Лимит</TableHead>
            <TableHead>Потрачено</TableHead>
            <TableHead>Остаток</TableHead>
            <TableHead className="min-w-[220px]">Прогресс</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="w-[150px] text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => {
            const badge = getBudgetStatusBadgeProps(budget.status);
            return (
              <TableRow key={budget.id}>
                <TableCell>
                  <div className="space-y-1">
                    <Typography tag="p" className="font-medium">
                      {BUDGET_TAG_LABELS[budget.tag]}
                    </Typography>
                    <Typography tag="p" className="text-muted-foreground text-xs">
                      {budget.remaining >= 0
                        ? `Осталось ${budgetCurrencyFormatter.format(budget.remaining)}`
                        : `Перерасход ${budgetCurrencyFormatter.format(Math.abs(budget.remaining))}`}
                    </Typography>
                  </div>
                </TableCell>
                <TableCell>{budgetCurrencyFormatter.format(budget.limit)}</TableCell>
                <TableCell>{budgetCurrencyFormatter.format(budget.spent)}</TableCell>
                <TableCell
                  className={budget.remaining >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-destructive"}
                >
                  {budgetCurrencyFormatter.format(budget.remaining)}
                </TableCell>
                <TableCell>
                  <BudgetProgressBar progressPercent={budget.progressPercent} status={budget.status} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={badge.className}>
                    {badge.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
                      <PencilIcon />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onArchive(budget)}>
                      <Trash2Icon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export { BudgetTable };
