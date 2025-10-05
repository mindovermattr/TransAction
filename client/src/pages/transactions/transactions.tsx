import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { TransactionTable } from "@/pages/transactions/ui/transaction-table";
import { TransactionWidgets } from "./ui/transaction-widgets";

const Transactions = () => {
  return (
    <>
      <header className="flex items-center gap-2">
        <SidebarTrigger />
        <Typography tag="h1" variant="title">
          Транзакции
        </Typography>
      </header>
      <TransactionWidgets />
      <TransactionTable />
    </>
  );
};

export { Transactions };
