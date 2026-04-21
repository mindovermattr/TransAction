import { AppPageHeader } from "@/components/ui/app-page-header";
import { PageActivityBadge } from "@/components/ui/page-activity-badge";
import { IncomeTable, TransactionTable, TransactionWidgets } from "./ui";

const Transactions = () => {
  return (
    <div className="space-y-4 lg:space-y-5">
      <AppPageHeader
        title="Транзакции"
        description="Контроль доходов и расходов в одном рабочем пространстве"
        rightSlot={<PageActivityBadge />}
      />

      <TransactionWidgets />
      <TransactionTable />
      <IncomeTable />
    </div>
  );
};

export { Transactions };
