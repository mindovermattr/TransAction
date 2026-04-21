import {
  useDeleteAccountMutation,
  useGetAccountsQuery,
  usePatchAccountMutation,
  usePostAccountMutation,
  usePostTransferMutation,
} from "@/api/hooks";
import { queryClient } from "@/api/query-client";
import { AppPageHeader } from "@/components/ui/app-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
import { Typography } from "@/components/ui/typography";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPES,
  accountGetSchema,
  accountPostSchema,
  transferPostSchema,
} from "@/schemas/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeftIcon, CirclePlusIcon, PiggyBankIcon, Trash2Icon, WalletCardsIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

type AccountFormInput = z.input<typeof accountPostSchema>;
type AccountFormValues = z.output<typeof accountPostSchema>;
type TransferFormInput = z.input<typeof transferPostSchema>;
type TransferFormValues = z.output<typeof transferPostSchema>;

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const todayInputValue = new Date().toISOString().slice(0, 10);

const Accounts = () => {
  const { data, isLoading, isFetching } = useGetAccountsQuery();
  const postAccountMutation = usePostAccountMutation();
  const patchAccountMutation = usePatchAccountMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const postTransferMutation = usePostTransferMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<z.infer<typeof accountGetSchema> | null>(null);
  const [archivingAccount, setArchivingAccount] = useState<z.infer<typeof accountGetSchema> | null>(null);

  const accounts = useMemo(() => (data ?? []).map((account) => accountGetSchema.parse(account)), [data]);
  const activeAccounts = accounts.filter((account) => !account.isArchived);

  const summary = useMemo(() => {
    const totalBalance = activeAccounts.reduce((sum, account) => sum + account.currentBalance, 0);
    const savingsBalance = activeAccounts
      .filter((account) => account.type === "savings")
      .reduce((sum, account) => sum + account.currentBalance, 0);
    const archivedCount = accounts.filter((account) => account.isArchived).length;

    return {
      totalBalance,
      activeCount: activeAccounts.length,
      archivedCount,
      savingsBalance,
    };
  }, [accounts, activeAccounts]);

  const createForm = useForm<AccountFormInput, undefined, AccountFormValues>({
    resolver: zodResolver(accountPostSchema),
    defaultValues: {
      name: "",
      type: "debit",
      currency: "RUB",
      openingBalance: 0,
    },
  });

  const editForm = useForm<AccountFormInput, undefined, AccountFormValues>({
    resolver: zodResolver(accountPostSchema),
    defaultValues: {
      name: "",
      type: "debit",
      currency: "RUB",
      openingBalance: 0,
    },
  });

  const transferForm = useForm<TransferFormInput, undefined, TransferFormValues>({
    resolver: zodResolver(transferPostSchema),
    defaultValues: {
      fromAccountId: 0,
      toAccountId: 0,
      amount: undefined,
      date: todayInputValue,
      note: "",
    },
  });

  useEffect(() => {
    if (!editingAccount) return;
    editForm.reset({
      name: editingAccount.name,
      type: editingAccount.type,
      currency: editingAccount.currency,
      openingBalance: editingAccount.openingBalance,
    });
  }, [editForm, editingAccount]);

  useEffect(() => {
    if (activeAccounts.length === 0) return;

    const currentFrom = transferForm.getValues("fromAccountId");
    const currentTo = transferForm.getValues("toAccountId");

    if (!currentFrom) {
      transferForm.setValue("fromAccountId", activeAccounts[0].id);
    }

    if (!currentTo && activeAccounts.length > 1) {
      transferForm.setValue("toAccountId", activeAccounts[1].id);
    } else if (!currentTo) {
      transferForm.setValue("toAccountId", activeAccounts[0].id);
    }
  }, [activeAccounts, transferForm]);

  const invalidateAccountsRelatedQueries = async () =>
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["transactions/summary"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["income"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["income", "summary"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["analytics"],
      }),
    ]);

  const onCreateAccount = async (values: AccountFormValues) => {
    await postAccountMutation.mutateAsync({
      params: values,
    });
    await invalidateAccountsRelatedQueries();
    setCreateOpen(false);
    createForm.reset({
      name: "",
      type: "debit",
      currency: "RUB",
      openingBalance: 0,
    });
  };

  const onEditAccount = async (values: AccountFormValues) => {
    if (!editingAccount) return;

    await patchAccountMutation.mutateAsync({
      params: {
        id: editingAccount.id,
        data: values,
      },
    });
    await invalidateAccountsRelatedQueries();
    setEditingAccount(null);
  };

  const onArchiveAccount = async () => {
    if (!archivingAccount) return;

    await deleteAccountMutation.mutateAsync({
      params: {
        id: archivingAccount.id,
      },
    });
    await invalidateAccountsRelatedQueries();
    setArchivingAccount(null);
  };

  const onTransfer = async (values: TransferFormValues) => {
    await postTransferMutation.mutateAsync({
      params: {
        ...values,
        note: values.note?.trim() ? values.note.trim() : undefined,
      },
    });
    await invalidateAccountsRelatedQueries();
    transferForm.reset({
      fromAccountId: activeAccounts[0]?.id ?? 0,
      toAccountId: activeAccounts[1]?.id ?? activeAccounts[0]?.id ?? 0,
      amount: undefined,
      date: todayInputValue,
      note: "",
    });
  };

  return (
    <>
      <div className="space-y-4 lg:space-y-5">
        <AppPageHeader
          title="Счета"
          description="Балансы, структура денег и переводы между кошельками"
          rightSlot={
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CirclePlusIcon className="h-4 w-4" />
                  Добавить счет
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Новый счет</DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateAccount)} className="flex flex-col gap-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название</FormLabel>
                          <FormControl>
                            <Input placeholder="Основная карта" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тип</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите тип" />
                              </SelectTrigger>
                              <SelectContent>
                                {ACCOUNT_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {ACCOUNT_TYPE_LABELS[type]}
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
                      control={createForm.control}
                      name="openingBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Стартовый баланс</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="numeric"
                              {...field}
                              value={field.value as string | number | undefined}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Отмена</Button>
                      </DialogClose>
                      <Button type="submit" disabled={postAccountMutation.isPending}>
                        Сохранить
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          }
        />

        <section className="bg-card rounded-xl border p-4 lg:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="bg-muted/45 rounded-lg p-4">
              <Typography tag="p" className="text-muted-foreground text-xs">
                Общий баланс
              </Typography>
              <Typography tag="p" className="text-2xl font-semibold">
                {currencyFormatter.format(summary.totalBalance)}
              </Typography>
            </div>
            <div className="bg-muted/45 rounded-lg p-4">
              <Typography tag="p" className="text-muted-foreground text-xs">
                Активные счета
              </Typography>
              <Typography tag="p" className="text-2xl font-semibold">
                {summary.activeCount}
              </Typography>
            </div>
            <div className="bg-muted/45 rounded-lg p-4">
              <Typography tag="p" className="text-muted-foreground text-xs">
                Резерв на накопительных
              </Typography>
              <Typography tag="p" className="text-2xl font-semibold">
                {currencyFormatter.format(summary.savingsBalance)}
              </Typography>
            </div>
            <div className="bg-muted/45 rounded-lg p-4">
              <Typography tag="p" className="text-muted-foreground text-xs">
                Архивные счета
              </Typography>
              <Typography tag="p" className="text-2xl font-semibold">
                {summary.archivedCount}
              </Typography>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <Card className="py-5.5">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <Typography tag="h3" variant="title" className="text-xl font-medium">
                  Портфель счетов
                </Typography>
                <Typography tag="p" className="text-muted-foreground text-sm">
                  Текущий баланс с учетом доходов, расходов и переводов
                </Typography>
              </div>
              <WalletCardsIcon className="text-muted-foreground h-5 w-5" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Typography tag="p">Загрузка счетов...</Typography>
              ) : accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-muted/35 flex flex-col gap-3 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Typography tag="p" className="font-semibold">
                            {account.name}
                          </Typography>
                          {account.isArchived ? (
                            <span className="rounded-full border px-2 py-0.5 text-xs">Архив</span>
                          ) : null}
                        </div>
                        <Typography tag="p" className="text-muted-foreground text-sm">
                          {ACCOUNT_TYPE_LABELS[account.type]} • старт {currencyFormatter.format(account.openingBalance)}
                        </Typography>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4 sm:items-center">
                        <div>
                          <Typography tag="p" className="text-muted-foreground text-xs">
                            Текущий баланс
                          </Typography>
                          <Typography tag="p" className="font-semibold">
                            {currencyFormatter.format(account.currentBalance)}
                          </Typography>
                        </div>
                        <div>
                          <Typography tag="p" className="text-muted-foreground text-xs">
                            Доходы
                          </Typography>
                          <Typography tag="p" className="font-semibold text-emerald-600">
                            +{currencyFormatter.format(account.incomeTotal)}
                          </Typography>
                        </div>
                        <div>
                          <Typography tag="p" className="text-muted-foreground text-xs">
                            Расходы
                          </Typography>
                          <Typography tag="p" className="font-semibold text-rose-600">
                            -{currencyFormatter.format(account.expenseTotal)}
                          </Typography>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingAccount(account)}>
                            Изменить
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setArchivingAccount(account)}
                            disabled={account.isArchived}
                          >
                            <Trash2Icon className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/35 rounded-xl border border-dashed p-6 text-center">
                  <Typography tag="p" className="font-medium">
                    Пока нет счетов
                  </Typography>
                  <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                    Создайте первый счет, чтобы привязать к нему доходы и расходы.
                  </Typography>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Typography tag="p" className="text-muted-foreground text-sm">
                {isFetching ? "Обновляем балансы..." : "Баланс считается на сервере"}
              </Typography>
              <div className="flex items-center gap-2 text-sm">
                <PiggyBankIcon className="h-4 w-4" />
                {currencyFormatter.format(summary.savingsBalance)} в резерве
              </div>
            </CardFooter>
          </Card>

          <Card className="py-5.5">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <Typography tag="h3" variant="title" className="text-xl font-medium">
                  Перевод между счетами
                </Typography>
                <Typography tag="p" className="text-muted-foreground text-sm">
                  Перенос средств без влияния на доходы и расходы
                </Typography>
              </div>
              <ArrowRightLeftIcon className="text-muted-foreground h-5 w-5" />
            </CardHeader>
            <CardContent>
              {activeAccounts.length < 2 ? (
                <div className="bg-muted/35 rounded-xl border border-dashed p-6">
                  <Typography tag="p" className="font-medium">
                    Нужны минимум два активных счета
                  </Typography>
                  <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                    Добавьте второй счет, чтобы делать переводы.
                  </Typography>
                </div>
              ) : (
                <Form {...transferForm}>
                  <form onSubmit={transferForm.handleSubmit(onTransfer)} className="flex flex-col gap-4">
                    <FormField
                      control={transferForm.control}
                      name="fromAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Со счета</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? String(field.value) : undefined}
                              onValueChange={(value) => field.onChange(Number(value))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите счет" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeAccounts.map((account) => (
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
                      control={transferForm.control}
                      name="toAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>На счет</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? String(field.value) : undefined}
                              onValueChange={(value) => field.onChange(Number(value))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите счет" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeAccounts.map((account) => (
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
                      control={transferForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Сумма</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="numeric"
                              {...field}
                              value={field.value as string | number | undefined}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={transferForm.control}
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
                      control={transferForm.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Комментарий</FormLabel>
                          <FormControl>
                            <Input placeholder="Например, пополнение подушки" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={postTransferMutation.isPending}>
                      Выполнить перевод
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={Boolean(editingAccount)}
        onOpenChange={(open) => {
          if (!open) setEditingAccount(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Редактировать счет</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditAccount)} className="flex flex-col gap-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input placeholder="Название счета" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCOUNT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {ACCOUNT_TYPE_LABELS[type]}
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
                control={editForm.control}
                name="openingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Стартовый баланс</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        {...field}
                        value={field.value as string | number | undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button type="submit" disabled={patchAccountMutation.isPending}>
                  Сохранить
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(archivingAccount)}
        onOpenChange={(open) => {
          if (!open) setArchivingAccount(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Архивировать счет?</DialogTitle>
          </DialogHeader>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Счет пропадет из селекторов новых операций, но история сохранится.
          </Typography>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button variant="destructive" onClick={onArchiveAccount} disabled={deleteAccountMutation.isPending}>
              Архивировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { Accounts };
