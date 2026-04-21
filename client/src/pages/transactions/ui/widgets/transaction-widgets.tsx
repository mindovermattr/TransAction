import { useGetTransactionsSummaryQuery } from "@/api/hooks";
import { useGetIncomeSummaryQuery } from "@/api/hooks/income/useGetIncomeSummaryQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { BanknoteArrowDownIcon, Wallet2Icon } from "lucide-react";
import { TransactionAddIncomeModal } from "../modals/transaction-add-income-modal";
import { TransactionSummaryCard } from "./transaction-summary-card";
import { calculateDifferencePercent } from "./transaction-widgets.utils";

const TransactionWidgets = () => {
  const { data, isLoading } = useGetTransactionsSummaryQuery();
  const { data: incomeData, isLoading: isIncomeLoading } = useGetIncomeSummaryQuery();

  if (isLoading || isIncomeLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="min-h-[204px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || !incomeData) return null;

  const previousExpenseAmount = data.prevMonthSum ?? 0;
  const currentExpenseAmount = data.currentMonthSum ?? 0;
  const previousIncomeAmount = incomeData.prevMonthSum ?? 0;
  const currentIncomeAmount = incomeData.currentMonthSum ?? 0;

  const incomeDifferencePercent = calculateDifferencePercent(currentIncomeAmount, previousIncomeAmount);
  const expenseDifferencePercent = calculateDifferencePercent(currentExpenseAmount, previousExpenseAmount);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TransactionSummaryCard
        variant="income"
        sectionLabel="Доходы"
        title="Поступления за месяц"
        currentAmount={currentIncomeAmount}
        previousAmount={previousIncomeAmount}
        differencePercent={incomeDifferencePercent}
        icon={Wallet2Icon}
        action={<TransactionAddIncomeModal />}
      />
      <TransactionSummaryCard
        variant="expense"
        sectionLabel="Расходы"
        title="Траты за месяц"
        currentAmount={currentExpenseAmount}
        previousAmount={previousExpenseAmount}
        differencePercent={expenseDifferencePercent}
        icon={BanknoteArrowDownIcon}
      />
    </div>
  );
};

export { TransactionWidgets };
