import { getTransactions } from "@/api/requests";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { TransactionTable } from "@/pages/transactions/ui/transaction-table";
import { transactionGetSchema } from "@/schemas/transaction.schema";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "../../components/Sidebar/app-sidebar";
import { columns } from "./transaction-column";
import { TransactionAddModal } from "./ui/transaction-add-modal";
import { TransactionWidgets } from "./ui/transaction-widgets";

const Transactions = () => {
  const { data, isFetching } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const transactions = await getTransactions();
      const parsedBody = transactions.map((el) =>
        transactionGetSchema.parse(el),
      );
      return parsedBody;
    },
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="m-4 gap-4">
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
            {!isFetching && <TransactionTable columns={columns} data={data!} />}
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
};

export { Transactions };
