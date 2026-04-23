import { Button } from "@/components/ui/button";
import { PageActivityBadge } from "@/components/ui/page-activity-badge";
import { PiggyBankIcon } from "lucide-react";
import { BudgetMonthSelector } from "./budget-month-selector";

const BudgetPageStatusBadge = ({
  isFetching,
  loadingError = false,
}: {
  isFetching?: boolean;
  loadingError?: boolean;
}) => <PageActivityBadge state={loadingError ? "error" : isFetching ? "fetching" : "idle"} />;

const BudgetPageHeaderActions = ({
  selectedMonth,
  onMonthChange,
  onCreateClick,
}: {
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  onCreateClick: () => void;
}) => (
  <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
    <BudgetMonthSelector value={selectedMonth} onChange={onMonthChange} />
    <Button onClick={onCreateClick}>
      <PiggyBankIcon />
      Создать бюджет
    </Button>
  </div>
);

export { BudgetPageHeaderActions, BudgetPageStatusBadge };
