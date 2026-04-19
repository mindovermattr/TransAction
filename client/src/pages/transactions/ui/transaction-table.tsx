import {
  useDeleteTransactionMutation,
  useGetTransactionsQuery,
  usePatchTransactionMutation,
} from "@/api/hooks";
import { queryClient } from "@/api/query-client";
import { TRANSACTION_TAGS_ICONS } from "@/constants/transaction-tags-icons";
import { Badge } from "@/components/ui/badge";
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
  DialogTitle,
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
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import {
  TRANSACTION_TAGS,
  transactionGetSchema,
  transactionPostSchema,
} from "@/schemas/transaction.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectGroup } from "@radix-ui/react-select";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CalendarRangeIcon,
  FunnelXIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { TransactionAddModal } from "./modals/transaction-add-modal";

type DatePreset = "all" | "thisMonth" | "last30" | "last90" | "custom";
type SortBy = "date" | "price" | "name";
type SortOrder = "asc" | "desc";

type TransactionFiltersState = {
  search: string;
  tag: "ALL" | TransactionTags;
  minAmount: string;
  maxAmount: string;
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_FILTERS: TransactionFiltersState = {
  search: "",
  tag: "ALL",
  minAmount: "",
  maxAmount: "",
  datePreset: "all",
  dateFrom: "",
  dateTo: "",
};

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: "Все даты", value: "all" },
  { label: "Этот месяц", value: "thisMonth" },
  { label: "Последние 30 дней", value: "last30" },
  { label: "Последние 90 дней", value: "last90" },
  { label: "Пользовательский", value: "custom" },
];

const getPresetRange = (preset: DatePreset) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  if (preset === "thisMonth") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to: now };
  }

  if (preset === "last30") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 29);
    return { from, to: now };
  }

  if (preset === "last90") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 89);
    return { from, to: now };
  }

  return { from: undefined as Date | undefined, to: undefined as Date | undefined };
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeFilters = (filters: TransactionFiltersState) => {
  const minAmount =
    filters.minAmount === "" ? undefined : Number.parseFloat(filters.minAmount);
  const maxAmount =
    filters.maxAmount === "" ? undefined : Number.parseFloat(filters.maxAmount);

  const safeMinAmount = Number.isNaN(minAmount) ? undefined : minAmount;
  const safeMaxAmount = Number.isNaN(maxAmount) ? undefined : maxAmount;

  if (filters.datePreset === "custom") {
    const from = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
    const to = filters.dateTo ? new Date(filters.dateTo) : undefined;
    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    return {
      search: filters.search.trim(),
      tag: filters.tag,
      minAmount: safeMinAmount,
      maxAmount: safeMaxAmount,
      dateFrom:
        from && !Number.isNaN(from.getTime()) ? from.toISOString() : undefined,
      dateTo: to && !Number.isNaN(to.getTime()) ? to.toISOString() : undefined,
    };
  }

  const { from, to } = getPresetRange(filters.datePreset);

  return {
    search: filters.search.trim(),
    tag: filters.tag,
    minAmount: safeMinAmount,
    maxAmount: safeMaxAmount,
    dateFrom: from?.toISOString(),
    dateTo: to?.toISOString(),
  };
};

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const TransactionTable = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] =
    useState<TransactionFiltersState>(DEFAULT_FILTERS);
  const [sorting, setSorting] = useState<{ sortBy: SortBy; sortOrder: SortOrder }>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [editingTransaction, setEditingTransaction] = useState<
    z.infer<typeof transactionGetSchema> | null
  >(null);
  const [deletingTransaction, setDeletingTransaction] = useState<
    z.infer<typeof transactionGetSchema> | null
  >(null);

  const normalizedFilters = useMemo(() => normalizeFilters(filters), [filters]);

  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.tag !== "ALL" ||
    filters.minAmount.length > 0 ||
    filters.maxAmount.length > 0 ||
    filters.datePreset !== "all" ||
    filters.dateFrom.length > 0 ||
    filters.dateTo.length > 0;

  const queryParams = useMemo(
    () => ({
      ...normalizedFilters,
      page,
      limit: 12,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
    }),
    [normalizedFilters, page, sorting.sortBy, sorting.sortOrder]
  );

  const { data, isFetching } = useGetTransactionsQuery(queryParams);

  const patchTransactionMutation = usePatchTransactionMutation();
  const deleteTransactionMutation = useDeleteTransactionMutation();

  const editForm = useForm({
    resolver: zodResolver(transactionPostSchema),
  });

  useEffect(() => {
    setPage(1);
  }, [normalizedFilters, sorting.sortBy, sorting.sortOrder]);

  useEffect(() => {
    if (!editingTransaction) return;
    editForm.reset({
      name: editingTransaction.name,
      tag: editingTransaction.tag,
      price: editingTransaction.price,
      date: toInputDate(editingTransaction.date),
    });
  }, [editForm, editingTransaction]);

  const transactions = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map((el) => transactionGetSchema.parse(el));
  }, [data?.items]);

  const pagination = data?.pagination;
  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const hasNext = pagination?.hasNext ?? false;
  const hasPrev = pagination?.hasPrev ?? false;

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
    return sorting.sortOrder === "asc" ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
  };

  const onEditSubmit = async (values: z.infer<typeof transactionPostSchema>) => {
    if (!editingTransaction) return;

    await patchTransactionMutation.mutateAsync({
      params: {
        id: editingTransaction.id,
        data: values,
      },
    });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      queryClient.invalidateQueries({ queryKey: ["transactions/summary"] }),
      queryClient.invalidateQueries({ queryKey: ["analytics"] }),
    ]);

    setEditingTransaction(null);
  };

  const onDelete = async () => {
    if (!deletingTransaction) return;

    await deleteTransactionMutation.mutateAsync({
      params: {
        id: deletingTransaction.id,
      },
    });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      queryClient.invalidateQueries({ queryKey: ["transactions/summary"] }),
      queryClient.invalidateQueries({ queryKey: ["analytics"] }),
    ]);

    setDeletingTransaction(null);
  };

  return (
    <>
      <Card className="relative gap-3 py-5.5">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Typography tag="h3" variant="title" className="text-xl font-medium">
                Лента транзакций
              </Typography>
              <Typography tag="p" className="text-muted-foreground text-sm">
                Серверные фильтры, сортировка и постраничная загрузка
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  <FunnelXIcon className="h-4 w-4" />
                  Сбросить фильтры
                </Button>
              ) : null}
              <TransactionAddModal />
            </div>
          </div>

          <div className="bg-muted/35 grid gap-3 rounded-lg border p-3 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, search: event.target.value }))
                }
                placeholder="Поиск по названию"
                className="bg-background pl-9"
              />
            </div>

            <Select
              value={filters.tag}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  tag: value as TransactionFiltersState["tag"],
                }))
              }
            >
              <SelectTrigger className="bg-background w-full">
                <SelectValue placeholder="Тег" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Фильтрация по тегу</SelectLabel>
                  <SelectItem value="ALL">Все теги</SelectItem>
                  <SelectSeparator />
                  {TRANSACTION_TAGS.map((option) => {
                    const TagIcon = TRANSACTION_TAGS_ICONS[option];
                    return (
                      <SelectItem key={option} value={option}>
                        <TagIcon />
                        {option}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <Input
                value={filters.minAmount}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, minAmount: event.target.value }))
                }
                inputMode="numeric"
                placeholder="Сумма от"
                className="bg-background"
              />
              <Input
                value={filters.maxAmount}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, maxAmount: event.target.value }))
                }
                inputMode="numeric"
                placeholder="Сумма до"
                className="bg-background"
              />
            </div>

            <Select
              value={filters.datePreset}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  datePreset: value as DatePreset,
                  dateFrom: value === "custom" ? prev.dateFrom : "",
                  dateTo: value === "custom" ? prev.dateTo : "",
                }))
              }
            >
              <SelectTrigger className="bg-background w-full">
                <CalendarRangeIcon className="h-4 w-4" />
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filters.datePreset === "custom" ? (
              <div className="grid grid-cols-1 gap-2 lg:col-span-5 lg:grid-cols-2">
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))
                  }
                  className="bg-background"
                />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, dateTo: event.target.value }))
                  }
                  className="bg-background"
                />
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent>
          {isFetching && (
            <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
              <Typography tag="span">Загрузка...</Typography>
            </div>
          )}

          <div className="max-h-[560px] rounded-md border">
            <Table className="[&_td]:px-3 [&_td]:py-2 [&_th]:h-9 [&_th]:px-3">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("name")}
                    >
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
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("date")}
                    >
                      Дата
                      {sortIcon("date")}
                    </button>
                  </TableHead>
                  <TableHead>Тег</TableHead>
                  <TableHead className="w-[120px] text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => {
                    const Icon =
                      TRANSACTION_TAGS_ICONS[transaction.tag] ??
                      TRANSACTION_TAGS_ICONS.OTHER;

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.name}</TableCell>
                        <TableCell>{currencyFormatter.format(transaction.price)}</TableCell>
                        <TableCell>
                          {transaction.date.toLocaleDateString("ru-RU")}
                        </TableCell>
                        <TableCell>
                          <Badge>
                            <Icon />
                            {transaction.tag}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingTransaction(transaction)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeletingTransaction(transaction)}
                            >
                              <Trash2Icon className="h-4 w-4 text-rose-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      По заданным параметрам ничего не найдено
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
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!hasNext}
              size="sm"
              variant="outline"
            >
              <ArrowRightIcon />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog
        open={Boolean(editingTransaction)}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Редактировать транзакцию</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="flex flex-col gap-4"
            >
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
              <FormField
                control={editForm.control}
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
                          {TRANSACTION_TAGS.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
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
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button type="submit" disabled={patchTransactionMutation.isPending}>
                  Сохранить
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingTransaction)}
        onOpenChange={(open) => {
          if (!open) setDeletingTransaction(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Удалить транзакцию?</DialogTitle>
          </DialogHeader>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Запись будет удалена без возможности восстановления.
          </Typography>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={deleteTransactionMutation.isPending}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { TransactionTable };
