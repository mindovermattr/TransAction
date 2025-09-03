import { useGetTransactionsQuery } from "@/api/hooks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { TransactionTable } from "@/pages/transactions/ui/transaction-table";
import { transactionGetSchema } from "@/schemas/transaction.schema";
import { useMemo } from "react";
import { columns } from "./transaction-columns";
import { TransactionAddModal } from "./ui/transaction-add-modal";
import { TransactionWidgets } from "./ui/transaction-widgets";

const Transactions = () => {
  const { data, isFetching } = useGetTransactionsQuery({
    options: {
      initialData: [],
    },
  });

  ///TODO:STORE
  const transactions = useMemo(() => {
    if (!data) return;
    const parsedBody = data.map((el) => transactionGetSchema.parse(el));
    return parsedBody;
  }, [data]);

  return (
    <>
      <header className="flex items-center gap-2">
        <SidebarTrigger />
        <Typography tag="h1" variant="title">
          Транзакции
        </Typography>
      </header>
      <TransactionWidgets isFetching={isFetching} />
      <Card>
        <CardHeader className="flex justify-between">
          <Typography tag="h3" variant="title" className="font-medium">
            Таблица расходов
          </Typography>
          <TransactionAddModal />
        </CardHeader>
        <CardContent>
          {!isFetching && (
            <TransactionTable columns={columns} data={transactions} />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export { Transactions };
