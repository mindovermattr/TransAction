import {
  useDeleteIncomeMutation,
  useGetIncomeQuery,
  usePatchIncomeMutation,
} from "@/api/hooks/income";
import { queryClient } from "@/api/query-client";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
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
import { TransactionAddIncomeModal } from "./transaction-add-income-modal";

type SortBy = "date" | "price" | "name";
type SortOrder = "asc" | "desc";

type IncomeFiltersState = {
  search: string;
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_FILTERS: IncomeFiltersState = {
  search: "",
  dateFrom: "",
  dateTo: "",
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const IncomeTable = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<IncomeFiltersState>(DEFAULT_FILTERS);
  const [sorting, setSorting] = useState<{ sortBy: SortBy; sortOrder: SortOrder }>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [editingIncome, setEditingIncome] = useState<
    z.infer<typeof incomeGetSchema> | null
  >(null);
  const [deletingIncome, setDeletingIncome] = useState<
    z.infer<typeof incomeGetSchema> | null
  >(null);

  const patchIncomeMutation = usePatchIncomeMutation();
  const deleteIncomeMutation = useDeleteIncomeMutation();

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
      date: toInputDate(editingIncome.date),
    });
  }, [editForm, editingIncome]);

  const queryParams = useMemo(() => {
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : undefined;
    if (dateTo) {
      dateTo.setHours(23, 59, 59, 999);
    }

    return {
      search: filters.search.trim() || undefined,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined,
      dateTo: dateTo?.toISOString(),
      page,
      limit: 12,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
    };
  }, [filters.dateFrom, filters.dateTo, filters.search, page, sorting.sortBy, sorting.sortOrder]);

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
    return sorting.sortOrder === "asc" ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
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
      queryClient.invalidateQueries({ queryKey: ["analytics"] }),
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
      queryClient.invalidateQueries({ queryKey: ["analytics"] }),
    ]);

    setDeletingIncome(null);
  };

  return (
    <>
      <Card className="relative gap-3 py-5.5">
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
            <TransactionAddIncomeModal />
          </div>

          <div className="bg-muted/35 grid gap-3 rounded-lg border p-3 lg:grid-cols-3">
            <div className="relative">
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
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingIncome(income)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingIncome(income)}
                          >
                            <Trash2Icon className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
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
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={deleteIncomeMutation.isPending}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { IncomeTable };
