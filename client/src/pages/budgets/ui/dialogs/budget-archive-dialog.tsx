import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { BUDGET_TAG_LABELS, budgetCurrencyFormatter, formatMonthLabel } from "../../lib";

const BudgetArchiveDialog = ({
  budget,
  open,
  onOpenChange,
  errorMessage,
  submitPending,
  onConfirm,
}: {
  budget: Budget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string | null;
  submitPending: boolean;
  onConfirm: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-md">
      <div className="border-b bg-muted/35 px-6 py-5">
        <DialogHeader className="gap-1 text-left">
          <DialogTitle>Архивировать бюджет</DialogTitle>
          <DialogDescription>Бюджет исчезнет из активного списка, но останется в истории данных.</DialogDescription>
        </DialogHeader>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
          <Typography tag="p" className="text-sm font-semibold">
            {budget ? BUDGET_TAG_LABELS[budget.tag] : "Выбранный бюджет"}
          </Typography>
          <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
            {budget
              ? `${formatMonthLabel(budget.month)} • лимит ${budgetCurrencyFormatter.format(budget.limit)}`
              : "Этот бюджет исчезнет из активного списка."}
          </Typography>
        </div>
        {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
      </div>

      <DialogFooter className="border-t bg-muted/20 px-6 py-4">
        <DialogClose asChild>
          <Button variant="outline">Отмена</Button>
        </DialogClose>
        <Button variant="destructive" onClick={onConfirm} disabled={submitPending}>
          Архивировать
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export { BudgetArchiveDialog };
