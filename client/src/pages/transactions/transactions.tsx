import { getTransactions } from "@/api/requests";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { columns } from "@/pages/transactions/transaction-column";
import { TransactionTable } from "@/pages/transactions/transaction-table";
import { useQuery } from "@tanstack/react-query";
import { BanknoteArrowDownIcon, Wallet2Icon } from "lucide-react";
import { AppSidebar } from "../../components/app-sidebar";

const columnsData = [
  {
    id: 1,
    createdAt: new Date("2025-07-17T03:21:28.224Z"),
    updatedAt: new Date("2025-07-17T03:21:28.224Z"),
    name: "Сделать",
    tag: "TRANSPORT",
    price: 40000,
    date: new Date("2023-07-17T03:21:28.218Z"),
    userId: 3,
  },
  {
    id: 2,
    createdAt: new Date("2025-07-17T03:21:28.224Z"),
    updatedAt: new Date("2025-07-17T03:21:28.224Z"),
    name: "Сделать",
    tag: "TRANSPORT",
    price: 5000,
    date: new Date("2025-07-17T03:21:28.218Z"),
    userId: 3,
  },
  {
    id: 3,
    createdAt: new Date("2025-07-17T03:21:28.224Z"),
    updatedAt: new Date("2025-07-17T03:21:28.224Z"),
    name: "Сделать",
    tag: "qwe",
    price: 25000,
    date: new Date("2024-07-17T03:21:28.218Z"),
    userId: 3,
  },
];

const Transactions = () => {
  const { isPending } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="m-4 gap-4">
        <header className="flex gap-2">
          <SidebarTrigger />
          <Typography tag="h1" variant="title">
            Транзакции
          </Typography>
        </header>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            {isPending && (
              <>
                <Skeleton className="aspect-video" />
                <Skeleton className="aspect-video" />
                <Skeleton className="aspect-video" />
              </>
            )}
            <Card>
              <CardHeader className="flex items-center">
                <Wallet2Icon size={18} />
                <Typography tag="h3" variant="title" className="font-medium">
                  Ваша прибыль
                </Typography>
              </CardHeader>
              <CardContent>
                <Typography
                  tag="h3"
                  variant="title"
                  className="text-3xl font-medium"
                >
                  123 000 руб
                </Typography>
              </CardContent>
              <CardFooter>
                <Typography tag="p" className="text-sm">
                  <Typography tag="span" className="text-sm text-emerald-300">
                    12%{" "}
                  </Typography>
                  в сравнении с прошлым месяцем
                </Typography>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="flex items-center">
                <BanknoteArrowDownIcon size={22} />
                <Typography tag="h3" variant="title" className="font-medium">
                  Сумма транзакций за месяц
                </Typography>
              </CardHeader>
              <CardContent>
                <Typography
                  tag="h3"
                  variant="title"
                  className="text-3xl font-medium"
                >
                  123 000 руб
                </Typography>
              </CardContent>
              <CardFooter>
                <Typography tag="p" className="text-sm">
                  На{" "}
                  <Typography tag="span" className="text-sm text-rose-500">
                    12% больше
                  </Typography>{" "}
                  чем в предыдущем месяце
                </Typography>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="flex items-center">
                <Wallet2Icon size={18} />
                <Typography tag="h3" variant="title" className="font-medium">
                  Ваша прибыль
                </Typography>
              </CardHeader>
              <CardContent>
                <Typography
                  tag="h3"
                  variant="title"
                  className="text-3xl font-medium"
                >
                  123 000 руб
                </Typography>
              </CardContent>
              <CardFooter>
                <Typography tag="p" className="text-sm">
                  На{" "}
                  <Typography tag="span" className="text-sm text-emerald-300">
                    12% больше
                  </Typography>{" "}
                  чем в предыдущем месяце
                </Typography>
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className="flex justify-between">
          <h3 className="font-medium">Таблица расходов</h3>
          <Button>+</Button>
        </div>
        <TransactionTable columns={columns} data={columnsData} />
      </SidebarInset>
    </SidebarProvider>
  );
};

export { Transactions };
