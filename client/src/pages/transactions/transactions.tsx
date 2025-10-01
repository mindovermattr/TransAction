import { useGetPaginatedTransactionsQuery } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { TransactionTable } from "@/pages/transactions/ui/transaction-table";
import { transactionGetSchema } from "@/schemas/transaction.schema";
import { keepPreviousData } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { columns } from "./transaction-columns";
import { TransactionAddModal } from "./ui/transaction-add-modal";
import { TransactionWidgets } from "./ui/transaction-widgets";

const TRANSACTIONS_LIMIT = 12;

const Transactions = () => {
  const [page, setPage] = useState(1);
  const { data, isFetching, refetch } = useGetPaginatedTransactionsQuery(
    {
      limit: TRANSACTIONS_LIMIT,
      page: page,
    },
    {
      options: {
        placeholderData: keepPreviousData,
      },
    },
  );

  ///TODO:STORE
  const transactions = useMemo(() => {
    if (!data) return [];

    const parsedBody = data.transactions.map((el) =>
      transactionGetSchema.parse(el),
    );
    return parsedBody;
  }, [data]);

  const isPrevPageEnabled = data?.pagination.hasPrev ?? false;
  const isNextPageEnabled = data?.pagination.hasNext ?? false;

  const prevPageHandler = () => {
    if (!isPrevPageEnabled) return;
    setPage((prev) => prev - 1);
    refetch();
  };
  const nextPageHandler = () => {
    if (!isNextPageEnabled) return;
    setPage((prev) => prev + 1);
    refetch();
  };

  return (
    <>
      <header className="flex items-center gap-2">
        <SidebarTrigger />
        <Typography tag="h1" variant="title">
          Транзакции
        </Typography>
      </header>

      <TransactionWidgets />
      <Card className="relative">
        <CardHeader className="flex justify-between">
          <Typography tag="h3" variant="title" className="font-medium">
            Таблица расходов
          </Typography>
          <TransactionAddModal />
        </CardHeader>
        <CardContent>
          {isFetching && (
            <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
              <Typography tag="span">Загрузка...</Typography>
            </div>
          )}
          <TransactionTable columns={columns} data={transactions} />
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button disabled={!isPrevPageEnabled} onClick={prevPageHandler}>
            <ArrowLeftIcon />
          </Button>
          <Typography tag="p" variant={"default"}>
            {page} / {data?.pagination.totalPages}
          </Typography>
          <Button disabled={!isNextPageEnabled} onClick={nextPageHandler}>
            <ArrowRightIcon />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export { Transactions };
