import { useDeleteIncomeMutation, useGetIncomeQuery, usePatchIncomeMutation } from "@/api/hooks/income";
import { useGetAccountsQuery } from "@/api/hooks";
import { queryClient } from "@/api/query-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { endOfDay, toDateInputValue } from "@/lib/date";
import { rubCurrencyFormatter } from "@/lib/formatters";
import { accountGetSchema } from "@/schemas/account.schema";
import { incomeGetSchema, incomePostSchema } from "@/schemas/income.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { TransactionAddIncomeModal } from "../modals/transaction-add-income-modal";

type SortBy = "date" | "price" | "name";
type SortOrder = "asc" | "desc";

type IncomeFiltersState = {
  search: string;
  accountId: "ALL" | string;
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_FILTERS: IncomeFiltersState = {
  search: "",
  accountId: "ALL",
  dateFrom: "",
  dateTo: "",
};

const currencyFormatter = rubCurrencyFormatter;

const TABLE_MAX_HEIGHT = 560;
const TABLE_HEAD_HEIGHT = 36;
const TABLE_ROW_HEIGHT = 44;
const PAGE_SIZE = Math.max(1, Math.floor((TABLE_MAX_HEIGHT - TABLE_HEAD_HEIGHT) / TABLE_ROW_HEIGHT));

const IncomeTable = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<IncomeFiltersState>(DEFAULT_FILTERS);
  const [sorting, setSorting] = useState<{
    sortBy: SortBy;
    sortOrder: SortOrder;
  }>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [editingIncome, setEditingIncome] = useState<z.infer<typeof incomeGetSchema> | null>(null);
  const [deletingIncome, setDeletingIncome] = useState<z.infer<typeof incomeGetSchema> | null>(null);
  const { data: accountsData } = useGetAccountsQuery();

  const patchIncomeMutation = usePatchIncomeMutation();
  const deleteIncomeMutation = useDeleteIncomeMutation();
  const accounts = useMemo(
    () => (accountsData ?? []).map((account) => accountGetSchema.parse(account)),
    [accountsData],
  );

  const editForm = useForm({
    resolver: zodResolver(incomePostSchema),
  });

  useEffect(() => {
    setPage(1);
  }, [filters.dateFrom, filters.dateTo, filters.search, sorting.sortBy, sorting.sortOrder]);

  useEffect(() => {
    if (!editingIncome) return;
    editForm.reset({
      name: editingIncome.name,
      price: editingIncome.price,
      date: toDateInputValue(editingIncome.date),
      accountId: editingIncome.accountId,
    });
  }, [editForm, editingIncome]);

  const queryParams = useMemo(() => {
    const dateTo = filters.dateTo ? endOfDay(new Date(filters.dateTo)) : undefined;

    return {
      search: filters.search.trim() || undefined,
      accountId: filters.accountId === "ALL" ? undefined : Number(filters.accountId),
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined,
      dateTo: dateTo?.toISOString(),
      page,
      limit: PAGE_SIZE,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
    };
  }, [filters.accountId, filters.dateFrom, filters.dateTo, filters.search, page, sorting.sortBy, sorting.sortOrder]);

  const { data, isFetching } = useGetIncomeQuery(queryParams);

  const incomes = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map((income) => incomeGetSchema.parse(income));
  }, [data?.items]);

  const pagination = data?.pagination;
  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const hasPrev = pagination?.hasPrev ?? false;
  const hasNext = pagination?.hasNext ?? false;

  const toggleSort = (sortBy: SortBy) => {
    setSorting((prev) => {
      if (prev.sortBy !== sortBy) {
        return {
          sortBy,
          sortOrder: sortBy === "name" ? "asc" : "desc",
        };
      }

      return {
        sortBy,
        sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
      };
    });
  };

  const sortIcon = (sortBy: SortBy) => {
    if (sorting.sortBy !== sortBy) return null;
    return sorting.sortOrder === "asc" ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />;
  };

  const onEditSubmit = async (values: z.infer<typeof incomePostSchema>) => {
    if (!editingIncome) return;

    await patchIncomeMutation.mutateAsync({
      params: {
        id: editingIncome.id,
        data: values,
      },
    });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["income"] }),
      queryClient.invalidateQueries({ queryKey: ["income", "summary"] }),
      queryClient.invalidateQueries({ queryKey: ["accounts"] }),
      queryClient.invalidateQueries({ queryKey: ["analytics"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] }),
    ]);

    setEditingIncome(null);
  };

  const onDelete = async () => {
    if (!deletingIncome) return;

    await deleteIncomeMutation.mutateAsync({
      params: {
        id: deletingIncome.id,
      },
    });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["income"] }),
      queryClient.invalidateQueries({ queryKey: ["income", "summary"] }),
      queryClient.invalidateQueries({ queryKey: ["accounts"] }),
      queryClient.invalidateQueries({ queryKey: ["analytics"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] }),
    ]);

    setDeletingIncome(null);
  };

  return (
    <>
      <Card className="relative gap-3 overflow-hidden py-5.5">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Typography tag="h3" variant="title" className="text-xl font-medium">
                Лента доходов
              </Typography>
              <Typography tag="p" className="text-muted-foreground text-sm">
                Отдельный журнал поступлений
              </Typography>
            </div>
            <div className="ml-auto flex self-end sm:self-auto">
              <TransactionAddIncomeModal />
            </div>
          </div>

          <div className="bg-muted/35 grid gap-3 rounded-lg border p-3 lg:grid-cols-4">
            <div className="relative">
              <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                  }))
                }
                placeholder="Поиск по названию"
                className="bg-background pl-9"
              />
            </div>
            <Select
              value={filters.accountId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, accountId: value }))}
            >
              <SelectTrigger className="bg-background w-full">
                <SelectValue placeholder="Счет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Все счета</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  dateFrom: event.target.value,
                }))
              }
              className="bg-background"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
              className="bg-background"
            />
          </div>
        </CardHeader>

        <CardContent className="min-h-0">
          {isFetching && (
            <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
              <Typography tag="span">Загрузка...</Typography>
            </div>
          )}

          <div className="max-h-[560px] overflow-hidden rounded-md border">
            <Table className="[&_td]:px-3 [&_td]:py-2 [&_th]:h-9 [&_th]:px-3">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("name")}>
                      Имя
                      {sortIcon("name")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("price")}
                    >
                      Сумма
                      {sortIcon("price")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("date")}>
                      Дата
                      {sortIcon("date")}
                    </button>
                  </TableHead>
                  <TableHead>Счет</TableHead>
                  <TableHead className="w-[120px] text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.length > 0 ? (
                  incomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>{income.name}</TableCell>
                      <TableCell>{currencyFormatter.format(income.price)}</TableCell>
                      <TableCell>{income.date.toLocaleDateString("ru-RU")}</TableCell>
                      <TableCell>{income.account.name}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="icon" onClick={() => setEditingIncome(income)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => setDeletingIncome(income)}>
                            <Trash2Icon className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Нет доходов по выбранным параметрам
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="min-h-14 justify-between gap-2">
          <Typography tag="p" className="text-muted-foreground text-sm">
            Найдено: {pagination?.totalItems ?? 0}
          </Typography>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={!hasPrev}
              size="sm"
              variant="outline"
            >
              <ArrowLeftIcon />
            </Button>
            <Typography tag="p" variant="default" className="min-w-14 text-center">
              {currentPage} / {Math.max(totalPages, 1)}
            </Typography>
            <Button onClick={() => setPage((prev) => prev + 1)} disabled={!hasNext} size="sm" variant="outline">
              <ArrowRightIcon />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog
        open={Boolean(editingIncome)}
        onOpenChange={(open) => {
          if (!open) setEditingIncome(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Редактировать доход</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Название" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
                name="price"
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button type="submit" disabled={patchIncomeMutation.isPending}>
                  Сохранить
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingIncome)}
        onOpenChange={(open) => {
          if (!open) setDeletingIncome(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Удалить доход?</DialogTitle>
          </DialogHeader>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Запись будет удалена без возможности восстановления.
          </Typography>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button variant="destructive" onClick={onDelete} disabled={deleteIncomeMutation.isPending}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { IncomeTable };
