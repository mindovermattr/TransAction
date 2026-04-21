import { useGetAccountsQuery } from "@/api/hooks";
import { usePostTransactionsMutation } from "@/api/hooks/transactions/usePostTransactionMutation";
import { queryClient } from "@/api/query-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRANSACTION_TAGS, transactionPostSchema } from "@/schemas/transaction.schema";
import { accountGetSchema } from "@/schemas/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlusIcon, type LucideIcon } from "lucide-react";
import { type ComponentProps, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

type TransactionFormInput = z.input<typeof transactionPostSchema>;
type TransactionFormValues = z.output<typeof transactionPostSchema>;

const TransactionAddModal = ({
  triggerLabel,
  triggerVariant = "outline",
  triggerSize = "icon",
  triggerClassName,
  triggerIcon: TriggerIcon = CirclePlusIcon,
}: {
  triggerLabel?: string;
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerSize?: ComponentProps<typeof Button>["size"];
  triggerClassName?: string;
  triggerIcon?: LucideIcon;
}) => {
  const [open, setIsOpen] = useState(false);
  const { data: accountsData } = useGetAccountsQuery();
  const accounts = useMemo(
    () => (accountsData ?? []).map((account) => accountGetSchema.parse(account)),
    [accountsData],
  );

  const form = useForm<TransactionFormInput, undefined, TransactionFormValues>({
    resolver: zodResolver(transactionPostSchema),
    defaultValues: {
      name: "",
      date: new Date().toISOString().slice(0, 10),
      price: undefined,
      tag: "OTHER",
      accountId: accounts[0]?.id ?? 0,
    },
  });

  const postTransactionMutation = usePostTransactionsMutation({
    options: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["transactions"] }),
          queryClient.invalidateQueries({ queryKey: ["transactions/summary"] }),
          queryClient.invalidateQueries({ queryKey: ["accounts"] }),
          queryClient.invalidateQueries({ queryKey: ["analytics"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] }),
        ]);
        setIsOpen(false);
        form.reset();
      },
    },
  });

  const submitHandler = async (data: TransactionFormValues) =>
    await postTransactionMutation.mutateAsync({
      params: data,
    });

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={triggerClassName}>
          <TriggerIcon />
          {triggerLabel ? <span>{triggerLabel}</span> : null}
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitHandler)} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Добавить транзакцию</DialogTitle>
            </DialogHeader>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Название операции" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цена</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Цена"
                      {...field}
                      value={field.value as string | number | undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Счет</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите счет" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={String(account.id)}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тег</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите тег" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSACTION_TAGS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Закрыть</Button>
              </DialogClose>
              <Button type="submit" disabled={accounts.length === 0}>
                Добавить
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { TransactionAddModal };
