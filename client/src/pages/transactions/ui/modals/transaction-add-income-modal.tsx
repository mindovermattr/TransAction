import { useGetAccountsQuery } from "@/api/hooks";
import { usePostIncomeMutation } from "@/api/hooks/income/usePostIncomeMutation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountGetSchema } from "@/schemas/account.schema";
import { incomePostSchema } from "@/schemas/income.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlusIcon, type LucideIcon } from "lucide-react";
import { type ComponentProps, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

type IncomeFormInput = z.input<typeof incomePostSchema>;
type IncomeFormValues = z.output<typeof incomePostSchema>;

const TransactionAddIncomeModal = ({
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
    () =>
      (accountsData ?? []).map((account) => accountGetSchema.parse(account)),
    [accountsData],
  );

  const form = useForm<IncomeFormInput, undefined, IncomeFormValues>({
    resolver: zodResolver(incomePostSchema),
    defaultValues: {
      name: "",
      date: new Date().toISOString().slice(0, 10),
      price: undefined,
      accountId: accounts[0]?.id ?? 0,
    },
  });

  const postIncomeMutation = usePostIncomeMutation({
    options: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["income"] }),
          queryClient.invalidateQueries({ queryKey: ["income", "summary"] }),
          queryClient.invalidateQueries({ queryKey: ["accounts"] }),
          queryClient.invalidateQueries({ queryKey: ["analytics"] }),
        ]);
        setIsOpen(false);
        form.reset();
      },
    },
  });

  const submitHandler = async (data: IncomeFormValues) =>
    await postIncomeMutation.mutateAsync({
      params: data,
    });

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          <TriggerIcon />
          {triggerLabel ? <span>{triggerLabel}</span> : null}
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitHandler)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Добавить доход</DialogTitle>
            </DialogHeader>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Источник дохода" {...field} />
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
                          <SelectItem
                            key={account.id}
                            value={String(account.id)}
                          >
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

export { TransactionAddIncomeModal };
