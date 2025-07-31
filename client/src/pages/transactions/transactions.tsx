import { getTransactions } from "@/api/requests";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { TransactionTable } from "@/pages/transactions/transaction-table";
import {
  transactionGetSchema,
  transactionSchema,
  TransactionTags,
} from "@/schemas/transaction.schema";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogTitle } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import {
  BanknoteArrowDownIcon,
  CirclePlusIcon,
  Wallet2Icon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { AppSidebar } from "../../components/Sidebar/app-sidebar";
import { columns } from "./transaction-column";

const formFields = [
  { name: "name", label: "Name", placeholder: "Enter name" },
  { name: "date", label: "Date", type: "date" },
  { name: "price", label: "Price", type: "number", placeholder: "0" },
  { name: "tag", label: "Tag", type: "select", options: TransactionTags },
] as const;

const Transactions = () => {
  const { data, isPending } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const transactions = await getTransactions();
      const body = transactions.map((el) => transactionGetSchema.parse(el));
      return body;
    },
  });

  const form = useForm({
    resolver: zodResolver(transactionSchema),
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
                  Бублик
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
        <Card>
          <CardHeader className="flex justify-between">
            <Typography tag="h3" variant="title" className="font-medium">
              Таблица расходов
            </Typography>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="self-center p-0">
                  <CirclePlusIcon />
                </Button>
              </DialogTrigger>
              <Form {...form}>
                <DialogContent showCloseButton={false}>
                  <form className="flex flex-col gap-3">
                    <DialogHeader>
                      <DialogTitle>Добавить транзакцию</DialogTitle>
                    </DialogHeader>
                    {formFields.map((formField) => (
                      <FormField
                        key={formField.name}
                        control={form.control}
                        name={formField.name}
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>{formField.label}</FormLabel>
                              <FormControl>
                                <Input
                                  type={formField.type}
                                  placeholder={formField?.placeholder || ""}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Закрыть</Button>
                      </DialogClose>
                      <Button type="submit">Добавить</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Form>
            </Dialog>
          </CardHeader>
          <CardContent>
            {!isPending && <TransactionTable columns={columns} data={data!} />}
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
};

export { Transactions };
