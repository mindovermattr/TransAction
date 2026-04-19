import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { Circle } from "lucide-react";
import { IncomeTable, TransactionTable, TransactionWidgets } from "./ui";

const Transactions = () => {
  return (
    <div className="space-y-4 lg:space-y-5">
      <section className="rounded-xl border bg-card p-4 lg:p-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2.5">
            <SidebarTrigger />
            <div className="space-y-1">
              <Typography tag="h1" variant="title" className="text-2xl">
                Транзакции
              </Typography>
              <Typography tag="p" className="text-muted-foreground text-sm">
                Контроль доходов и расходов в одном рабочем пространстве
              </Typography>
            </div>
          </div>

          <div className="border-border/60 text-muted-foreground inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium">
            <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
            <span className="w-[78px] text-left">Актуально</span>
          </div>
        </header>
      </section>

      <TransactionWidgets />
      <TransactionTable />
      <IncomeTable />
    </div>
  );
};

export { Transactions };
