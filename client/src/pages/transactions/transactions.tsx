import { AppPageHeader } from "@/components/ui/app-page-header";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import { IncomeTable, TransactionTable, TransactionWidgets } from "./ui";

const Transactions = () => {
  return (
    <div className="space-y-4 lg:space-y-5">
      <AppPageHeader
        title="Транзакции"
        description="Контроль доходов и расходов в одном рабочем пространстве"
        rightSlot={
          <Badge variant="outline" className="gap-1.5 self-start rounded-full px-3 py-1">
            <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
            Актуально
          </Badge>
        }
      />

      <TransactionWidgets />
      <TransactionTable />
      <IncomeTable />
    </div>
  );
};

export { Transactions };
