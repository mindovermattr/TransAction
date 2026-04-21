import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Circle, PiggyBankIcon } from "lucide-react";
import { BudgetMonthSelector } from "./budget-month-selector";

const BudgetPageHeaderActions = ({
  isFetching,
  selectedMonth,
  onMonthChange,
  onCreateClick,
  loadingError = false,
}: {
  isFetching?: boolean;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  onCreateClick: () => void;
  loadingError?: boolean;
}) => (
  <>
    <Badge variant="outline" className="gap-1.5 self-start rounded-full px-3 py-1">
      <Circle
        className={
          loadingError
            ? "h-2.5 w-2.5 fill-amber-500 text-amber-500"
            : isFetching
              ? "h-2.5 w-2.5 fill-amber-500 text-amber-500"
              : "h-2.5 w-2.5 fill-emerald-500 text-emerald-500"
        }
      />
      {loadingError ? "Ошибка загрузки" : isFetching ? "Обновление" : "Актуально"}
    </Badge>
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <BudgetMonthSelector value={selectedMonth} onChange={onMonthChange} />
      <Button onClick={onCreateClick}>
        <PiggyBankIcon />
        Создать бюджет
      </Button>
    </div>
  </>
);

export { BudgetPageHeaderActions };
