import {
  useDeleteBudgetMutation,
  useGetBudgetsQuery,
  usePatchBudgetMutation,
  usePostBudgetMutation,
} from "@/api/hooks";
import { queryClient } from "@/api/query-client";
import { AppPageHeader } from "@/components/ui/app-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { TRANSACTION_TAGS_ICONS } from "@/constants/transaction-tags-icons";
import { budgetsResponseSchema, budgetPostSchema } from "@/schemas/budget.schema";
import { TRANSACTION_TAGS } from "@/schemas/transaction.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Circle,
  PencilIcon,
  PiggyBankIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import z from "zod";

const currentMonthValue = new Date().toISOString().slice(0, 7);

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const BUDGET_TAG_LABELS: Record<TransactionTags, string> = {
  FOOD: "Еда",
  HOUSING: "Жильё",
  TRANSPORT: "Транспорт",
  EDUCATION: "Обучение",
  JOY: "Досуг",
  OTHER: "Другое",
};

type BudgetFormInput = z.input<typeof budgetPostSchema>;
type BudgetFormValues = z.output<typeof budgetPostSchema>;
type BudgetMonthOption = {
  value: string;
  label: string;
  isCurrent: boolean;
};

const getMonthDate = (value: string) => new Date(`${value}-01T00:00:00.000Z`);

const formatMonthLabel = (value: string) => {
  const label = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(getMonthDate(value));

  return label.replace(/^\p{L}/u, (letter) => letter.toUpperCase());
};

const shiftMonthValue = (value: string, delta: number) => {
  const date = getMonthDate(value);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 7);
};

const getBudgetMonthOptions = (anchorMonth: string): BudgetMonthOption[] =>
  Array.from({ length: 8 }, (_, index) => {
    const value = shiftMonthValue(anchorMonth, index - 3);
    return {
      value,
      label: formatMonthLabel(value),
      isCurrent: value === currentMonthValue,
    };
  });

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      data?: {
        message?: string;
      };
      message?: string;
    };

    if (typeof apiError.data?.message === "string" && apiError.data.message.length > 0) {
      return apiError.data.message;
    }

    if (typeof apiError.message === "string" && apiError.message.length > 0) {
      return apiError.message;
    }
  }

  return fallback;
};

const getBudgetStatusBadgeProps = (status: BudgetStatus) => {
  if (status === "over") {
    return {
      label: "Сверх лимита",
      className: "border-transparent bg-destructive text-destructive-foreground",
    };
  }

  if (status === "warning") {
    return {
      label: "Близко к лимиту",
      className: "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300",
    };
  }

  return {
    label: "Норма",
    className: "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  };
};

const getBudgetProgressBarClassName = (status: BudgetStatus) => {
  if (status === "over") {
    return "bg-destructive";
  }

  if (status === "warning") {
    return "bg-amber-500";
  }

  return "bg-primary";
};

const BudgetProgressBar = ({
  progressPercent,
  status,
}: {
  progressPercent: number;
  status: BudgetStatus;
}) => (
  <div className="space-y-1.5">
    <div className="bg-muted h-2.5 overflow-hidden rounded-full">
      <div
        className={`h-full rounded-full transition-[width] ${getBudgetProgressBarClassName(status)}`}
        style={{ width: `${Math.min(progressPercent, 100)}%` }}
      />
    </div>
    <div className="text-muted-foreground flex items-center justify-between text-xs">
      <span>{progressPercent}% лимита</span>
      {progressPercent > 100 ? <span>Перерасход</span> : null}
    </div>
  </div>
);

const BudgetSummaryCard = ({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) => (
  <Card className="gap-3 py-5">
    <CardHeader className="px-5 pb-0">
      <Typography tag="p" className="text-muted-foreground text-xs">
        {title}
      </Typography>
      <CardTitle className="text-2xl">{value}</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pt-0">
      <Typography tag="p" className="text-muted-foreground text-sm">
        {hint}
      </Typography>
    </CardContent>
  </Card>
);

const MonthSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const isCurrentMonth = value === currentMonthValue;

  return (
    <div className="bg-card flex items-center gap-1 rounded-xl border p-1 shadow-xs">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg"
        onClick={() => onChange(shiftMonthValue(value, -1))}
      >
        <ChevronLeftIcon />
      </Button>
      <div className="min-w-[148px] px-2 text-center">
        <Typography tag="p" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Период
        </Typography>
        <Typography tag="p" className="text-sm font-semibold">
          {formatMonthLabel(value)}
        </Typography>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg"
        onClick={() => onChange(shiftMonthValue(value, 1))}
      >
        <ChevronRightIcon />
      </Button>
      <div className="hidden pl-1 sm:block">
        <Button
          type="button"
          variant={isCurrentMonth ? "secondary" : "outline"}
          size="sm"
          className="rounded-lg"
          onClick={() => onChange(currentMonthValue)}
          disabled={isCurrentMonth}
        >
          Текущий
        </Button>
      </div>
    </div>
  );
};

const BudgetVsActualChartCard = ({ items }: { items: Budget[] }) => {
  const chartItems = items.slice(0, 6);
  const leadingBudget = chartItems[0] ?? null;
  const maxSpent = chartItems.reduce((max, item) => Math.max(max, item.spent, item.limit), 0);

  return (
    <Card className="h-full gap-4 py-5">
      <CardHeader className="px-5 pb-0">
        <CardTitle>Budget vs Actual</CardTitle>
        <Typography tag="p" className="text-muted-foreground text-sm">
          Где лимит уже съеден, а где еще есть запас
        </Typography>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-5 pt-0">
        {chartItems.length === 0 ? (
          <div className="border-border/70 text-muted-foreground flex min-h-[280px] flex-1 items-center justify-center rounded-lg border border-dashed text-sm">
            Нет данных для графика.
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-muted/45 rounded-lg border p-3">
                <Typography tag="p" className="text-muted-foreground text-[11px] uppercase tracking-[0.16em]">
                  Самое узкое место
                </Typography>
                <Typography tag="p" className="mt-1 text-base font-semibold">
                  {leadingBudget ? BUDGET_TAG_LABELS[leadingBudget.tag] : "—"}
                </Typography>
                <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                  {leadingBudget
                    ? leadingBudget.remaining >= 0
                      ? `Остаток ${currencyFormatter.format(leadingBudget.remaining)}`
                      : `Перерасход ${currencyFormatter.format(Math.abs(leadingBudget.remaining))}`
                    : "Нет данных"}
                </Typography>
              </div>
              <div className="bg-muted/45 rounded-lg border p-3">
                <Typography tag="p" className="text-muted-foreground text-[11px] uppercase tracking-[0.16em]">
                  Срез по категориям
                </Typography>
                <Typography tag="p" className="mt-1 text-base font-semibold">
                  {chartItems.length} в фокусе
                </Typography>
                <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                  Сначала проблемные, потом стабильные категории
                </Typography>
              </div>
            </div>

            <div className="space-y-3">
              {chartItems.map((item) => {
                const limitWidth = maxSpent > 0 ? (item.limit / maxSpent) * 100 : 0;
                const spentWidth = maxSpent > 0 ? (item.spent / maxSpent) * 100 : 0;

                return (
                  <div key={item.id} className="space-y-2 rounded-lg border border-border/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Typography tag="p" className="truncate font-medium">
                          {BUDGET_TAG_LABELS[item.tag]}
                        </Typography>
                        <Typography tag="p" className="text-muted-foreground text-xs">
                          {currencyFormatter.format(item.spent)} из {currencyFormatter.format(item.limit)}
                        </Typography>
                      </div>
                      <Typography
                        tag="p"
                        className={
                          item.remaining >= 0
                            ? "text-xs font-medium text-emerald-600 dark:text-emerald-300"
                            : "text-destructive text-xs font-medium"
                        }
                      >
                        {item.remaining >= 0
                          ? `+${currencyFormatter.format(item.remaining)}`
                          : `-${currencyFormatter.format(Math.abs(item.remaining))}`}
                      </Typography>
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                          <span>Лимит</span>
                          <span>{compactCurrencyFormatter.format(item.limit)}</span>
                        </div>
                        <div className="bg-muted h-2 rounded-full">
                          <div
                            className="h-full rounded-full bg-[var(--color-chart-2)]"
                            style={{ width: `${limitWidth}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                          <span>Факт</span>
                          <span>{compactCurrencyFormatter.format(item.spent)}</span>
                        </div>
                        <div className="bg-muted h-2.5 rounded-full">
                          <div
                            className={`h-full rounded-full ${getBudgetProgressBarClassName(item.status)}`}
                            style={{ width: `${Math.min(spentWidth, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const BudgetEditorDialogForm = ({
  form,
  title,
  description,
  monthOptions,
  submitLabel,
  submitPending,
  errorMessage,
  onSubmit,
}: {
  form: UseFormReturn<BudgetFormInput, undefined, BudgetFormValues>;
  title: string;
  description: string;
  monthOptions: BudgetMonthOption[];
  submitLabel: string;
  submitPending: boolean;
  errorMessage: string | null;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
}) => {
  const selectedTag = form.watch("tag");
  const selectedMonth = form.watch("month");
  const selectedLimit = form.watch("limit");
  const SelectedTagIcon = TRANSACTION_TAGS_ICONS[selectedTag];

  return (
    <>
      <div className="border-b bg-muted/35 px-6 py-5">
        <DialogHeader className="gap-1 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="space-y-5 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Период</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-auto w-full rounded-xl border-border/70 px-3 py-3">
                          <div className="min-w-0 text-left">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                              Месяц
                            </p>
                            <p className="truncate text-sm font-medium">{formatMonthLabel(field.value)}</p>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex w-full items-center justify-between gap-3">
                                <span>{option.label}</span>
                                {option.isCurrent ? (
                                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                    Текущий
                                  </span>
                                ) : null}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>Бюджет считается на весь выбранный месяц.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => {
                  const CurrentTagIcon = TRANSACTION_TAGS_ICONS[field.value];

                  return (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-auto w-full rounded-xl border-border/70 px-3 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70">
                                <CurrentTagIcon className="size-4" />
                              </div>
                              <div className="min-w-0 text-left">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                  Категория
                                </p>
                                <p className="truncate text-sm font-medium">{BUDGET_TAG_LABELS[field.value]}</p>
                              </div>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSACTION_TAGS.map((tag) => {
                              const TagIcon = TRANSACTION_TAGS_ICONS[tag];
                              return (
                                <SelectItem key={tag} value={tag}>
                                  <span className="flex items-center gap-2">
                                    <TagIcon className="size-4" />
                                    <span>{BUDGET_TAG_LABELS[tag]}</span>
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>Статус бюджета будет считаться по расходам этой категории.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
              <div className="mb-4 flex items-start gap-3">
                <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70">
                  <SelectedTagIcon className="size-4" />
                </div>
                <div>
                  <Typography tag="p" className="text-sm font-semibold">
                    {BUDGET_TAG_LABELS[selectedTag]}
                  </Typography>
                  <Typography tag="p" className="text-muted-foreground text-sm">
                    {selectedMonth ? formatMonthLabel(selectedMonth) : "Выберите период"}
                  </Typography>
                </div>
              </div>

              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Лимит на месяц</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                          ₽
                        </span>
                        <Input
                          type="number"
                          placeholder="15000"
                          {...field}
                          value={field.value as string | number | undefined}
                          className="h-14 rounded-xl border-border/70 pr-4 pl-10 text-lg font-semibold"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Остальное считаем автоматически: факт, остаток и статус риска.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <Typography tag="p" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Период
                  </Typography>
                  <Typography tag="p" className="mt-1 text-sm font-medium">
                    {selectedMonth ? formatMonthLabel(selectedMonth) : "Не выбран"}
                  </Typography>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <Typography tag="p" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Плановый лимит
                  </Typography>
                  <Typography tag="p" className="mt-1 text-sm font-medium">
                    {typeof selectedLimit === "number"
                      ? currencyFormatter.format(selectedLimit)
                      : "Введите сумму"}
                  </Typography>
                </div>
              </div>
            </div>

            {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
          </div>

          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <DialogClose asChild>
              <Button variant="outline">Закрыть</Button>
            </DialogClose>
            <Button type="submit" disabled={submitPending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

const Budgets = () => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [archivingBudget, setArchivingBudget] = useState<Budget | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetBudgetsQuery({
    month: selectedMonth,
  });

  const parsedData = useMemo(() => (data ? budgetsResponseSchema.parse(data) : undefined), [data]);

  const budgets = useMemo(
    () =>
      [...(parsedData?.items ?? [])].sort((left, right) => {
        const severity = {
          over: 0,
          warning: 1,
          ok: 2,
        } satisfies Record<BudgetStatus, number>;

        return (
          severity[left.status] - severity[right.status] ||
          right.progressPercent - left.progressPercent ||
          left.tag.localeCompare(right.tag)
        );
      }),
    [parsedData?.items],
  );

  const postBudgetMutation = usePostBudgetMutation();
  const patchBudgetMutation = usePatchBudgetMutation();
  const deleteBudgetMutation = useDeleteBudgetMutation();

  const createForm = useForm<BudgetFormInput, undefined, BudgetFormValues>({
    resolver: zodResolver(budgetPostSchema),
    defaultValues: {
      month: selectedMonth,
      tag: "FOOD",
      limit: undefined,
    },
  });

  const editForm = useForm<BudgetFormInput, undefined, BudgetFormValues>({
    resolver: zodResolver(budgetPostSchema),
    defaultValues: {
      month: selectedMonth,
      tag: "FOOD",
      limit: undefined,
    },
  });

  useEffect(() => {
    createForm.setValue("month", selectedMonth);
  }, [createForm, selectedMonth]);

  useEffect(() => {
    if (!editingBudget) return;

    editForm.reset({
      month: editingBudget.month,
      tag: editingBudget.tag,
      limit: editingBudget.limit,
    });
  }, [editForm, editingBudget]);

  const invalidateBudgetQueries = async () =>
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["budgets"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "overview"],
      }),
    ]);

  const onCreateBudget = async (values: BudgetFormValues) => {
    try {
      setCreateError(null);
      await postBudgetMutation.mutateAsync({
        params: values,
      });
      await invalidateBudgetQueries();
      setSelectedMonth(values.month);
      setCreateOpen(false);
      createForm.reset({
        month: values.month,
        tag: "FOOD",
        limit: undefined,
      });
    } catch (error) {
      setCreateError(getApiErrorMessage(error, "Не удалось создать бюджет"));
    }
  };

  const onEditBudget = async (values: BudgetFormValues) => {
    if (!editingBudget) return;

    try {
      setEditError(null);
      await patchBudgetMutation.mutateAsync({
        params: {
          id: editingBudget.id,
          data: values,
        },
      });
      await invalidateBudgetQueries();
      setSelectedMonth(values.month);
      setEditingBudget(null);
    } catch (error) {
      setEditError(getApiErrorMessage(error, "Не удалось обновить бюджет"));
    }
  };

  const onArchiveBudget = async () => {
    if (!archivingBudget) return;

    try {
      setArchiveError(null);
      await deleteBudgetMutation.mutateAsync({
        params: {
          id: archivingBudget.id,
        },
      });
      await invalidateBudgetQueries();
      setArchivingBudget(null);
    } catch (error) {
      setArchiveError(getApiErrorMessage(error, "Не удалось архивировать бюджет"));
    }
  };

  const summary = parsedData?.summary ?? {
    totalLimit: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overCount: 0,
    warningCount: 0,
    activeCount: 0,
  };

  const createMonthOptions = useMemo(
    () => getBudgetMonthOptions(selectedMonth),
    [selectedMonth],
  );
  const editMonthOptions = useMemo(
    () => getBudgetMonthOptions(editingBudget?.month ?? selectedMonth),
    [editingBudget?.month, selectedMonth],
  );

  const primaryBudget = budgets[0] ?? null;

  const alertCard = useMemo(() => {
    if (summary.overCount > 0) {
      const overspend = primaryBudget?.status === "over" ? Math.abs(primaryBudget.remaining) : 0;
      return {
        title: `${summary.overCount} бюджет${summary.overCount === 1 ? "" : summary.overCount < 5 ? "а" : "ов"} сверх лимита`,
        hint:
          primaryBudget?.status === "over"
            ? `${BUDGET_TAG_LABELS[primaryBudget.tag]} • перерасход ${currencyFormatter.format(overspend)}`
            : "Нужно поднять лимит или сократить траты",
        className:
          "border-destructive/20 bg-destructive/10",
        valueClassName: "text-destructive",
      };
    }

    if (summary.warningCount > 0) {
      return {
        title: `${summary.warningCount} бюджета близко к лимиту`,
        hint:
          primaryBudget?.status === "warning"
            ? `${BUDGET_TAG_LABELS[primaryBudget.tag]} • ${primaryBudget.progressPercent}% лимита`
            : "Проверьте категории, которые скоро упрутся в лимит",
        className:
          "border-amber-500/25 bg-amber-500/10",
        valueClassName: "text-amber-700 dark:text-amber-300",
      };
    }

    if (summary.activeCount > 0) {
      return {
        title: "Бюджеты под контролем",
        hint: `Активных бюджетов: ${summary.activeCount}. Остаток ${currencyFormatter.format(summary.totalRemaining)}.`,
        className:
          "border-emerald-500/25 bg-emerald-500/10",
        valueClassName: "text-emerald-700 dark:text-emerald-300",
      };
    }

    return {
      title: "На этот месяц бюджеты не созданы",
      hint: "Добавьте лимиты по категориям, чтобы видеть перерасход заранее.",
      className: "border-border/70 bg-muted/35",
      valueClassName: "text-foreground",
    };
  }, [primaryBudget, summary.activeCount, summary.overCount, summary.totalRemaining, summary.warningCount]);

  if (isLoading && !parsedData) {
    return (
      <div className="space-y-4 lg:space-y-5">
        <AppPageHeader
          title="Бюджеты"
          description="Лимиты по категориям на выбранный месяц"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
        <Skeleton className="h-[140px] rounded-xl" />
        <div className="grid gap-4 xl:grid-cols-12">
          <Skeleton className="h-[520px] rounded-xl xl:col-span-8" />
          <Skeleton className="h-[520px] rounded-xl xl:col-span-4" />
        </div>
      </div>
    );
  }

  if (isError && !parsedData) {
    return (
      <div className="space-y-4 lg:space-y-5">
        <AppPageHeader
          title="Бюджеты"
          description="Лимиты по категориям на выбранный месяц"
          rightSlot={
            <>
              <Badge variant="outline" className="gap-1.5 self-start rounded-full px-3 py-1">
                <Circle className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                Ошибка загрузки
              </Badge>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
                <Button onClick={() => setCreateOpen(true)}>
                  <PiggyBankIcon />
                  Создать бюджет
                </Button>
              </div>
            </>
          }
        />

        <Card className="py-5">
          <CardHeader className="px-5 pb-0">
            <CardTitle>Не удалось загрузить бюджеты</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pt-0">
            <Typography tag="p" className="text-muted-foreground text-sm">
              Проверьте соединение и повторите попытку.
            </Typography>
            <Button className="mt-4" onClick={() => void refetch()}>
              Повторить
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 lg:space-y-5">
        <AppPageHeader
          title="Бюджеты"
          description="Лимиты по категориям на выбранный месяц"
          rightSlot={
            <>
              <Badge variant="outline" className="gap-1.5 self-start rounded-full px-3 py-1">
                <Circle
                  className={
                    isFetching
                      ? "h-2.5 w-2.5 fill-amber-500 text-amber-500"
                      : "h-2.5 w-2.5 fill-emerald-500 text-emerald-500"
                  }
                />
                {isFetching ? "Обновление" : "Актуально"}
              </Badge>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
                <Button onClick={() => setCreateOpen(true)}>
                  <PiggyBankIcon />
                  Создать бюджет
                </Button>
              </div>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <BudgetSummaryCard
            title="Общий бюджет"
            value={currencyFormatter.format(summary.totalLimit)}
            hint={`${summary.activeCount} активных категорий в работе`}
          />
          <BudgetSummaryCard
            title="Потрачено"
            value={currencyFormatter.format(summary.totalSpent)}
            hint={`Остаток ${currencyFormatter.format(summary.totalRemaining)}`}
          />
          <BudgetSummaryCard
            title="Сверх лимита"
            value={String(summary.overCount)}
            hint={
              summary.warningCount > 0
                ? `${summary.warningCount} близко к лимиту`
                : "Категории с warning появятся здесь"
            }
          />
        </div>

        <Card className={`gap-3 py-5 ${alertCard.className}`}>
          <CardHeader className="px-5 pb-0">
            <Typography tag="p" className="text-muted-foreground text-xs">
              Что важно сейчас
            </Typography>
            <CardTitle className={`text-xl ${alertCard.valueClassName}`}>{alertCard.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pt-0">
            <Typography tag="p" className="text-muted-foreground text-sm">
              {alertCard.hint}
            </Typography>
          </CardContent>
        </Card>

        {budgets.length === 0 ? (
          <Card className="py-6">
            <CardContent className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <PiggyBankIcon className="text-muted-foreground h-6 w-6" />
              </div>
              <Typography tag="h2" className="text-lg font-semibold">
                На этот месяц бюджеты не созданы
              </Typography>
              <Typography tag="p" className="text-muted-foreground mt-2 max-w-md text-sm">
                Добавьте лимиты по категориям, чтобы видеть перерасход заранее. Обычно начинают с еды,
                жилья и транспорта.
              </Typography>
              <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                Создать первый бюджет
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <Card className="hidden py-5 md:flex">
                <CardHeader className="px-5 pb-0">
                  <CardTitle>Категории месяца</CardTitle>
                  <Typography tag="p" className="text-muted-foreground text-sm">
                    Сначала самые проблемные категории, потом стабильные.
                  </Typography>
                </CardHeader>
                <CardContent className="px-5 pt-0">
                  <Table className="[&_td]:px-3 [&_td]:py-3 [&_th]:h-9 [&_th]:px-3">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Категория</TableHead>
                        <TableHead>Лимит</TableHead>
                        <TableHead>Потрачено</TableHead>
                        <TableHead>Остаток</TableHead>
                        <TableHead className="min-w-[220px]">Прогресс</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="w-[150px] text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgets.map((budget) => {
                        const badge = getBudgetStatusBadgeProps(budget.status);
                        return (
                          <TableRow key={budget.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <Typography tag="p" className="font-medium">
                                  {BUDGET_TAG_LABELS[budget.tag]}
                                </Typography>
                                <Typography tag="p" className="text-muted-foreground text-xs">
                                  {budget.remaining >= 0
                                    ? `Осталось ${currencyFormatter.format(budget.remaining)}`
                                    : `Перерасход ${currencyFormatter.format(Math.abs(budget.remaining))}`}
                                </Typography>
                              </div>
                            </TableCell>
                            <TableCell>{currencyFormatter.format(budget.limit)}</TableCell>
                            <TableCell>{currencyFormatter.format(budget.spent)}</TableCell>
                            <TableCell
                              className={
                                budget.remaining >= 0
                                  ? "text-emerald-600 dark:text-emerald-300"
                                  : "text-destructive"
                              }
                            >
                              {currencyFormatter.format(budget.remaining)}
                            </TableCell>
                            <TableCell>
                              <BudgetProgressBar
                                progressPercent={budget.progressPercent}
                                status={budget.status}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={badge.className}>
                                {badge.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setEditingBudget(budget)}>
                                  <PencilIcon />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setArchivingBudget(budget)}>
                                  <Trash2Icon />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid gap-3 md:hidden">
                {budgets.map((budget) => {
                  const badge = getBudgetStatusBadgeProps(budget.status);
                  return (
                    <Card key={budget.id} className="gap-4 py-5">
                      <CardHeader className="px-5 pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-base">{BUDGET_TAG_LABELS[budget.tag]}</CardTitle>
                            <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                              {currencyFormatter.format(budget.spent)} из {currencyFormatter.format(budget.limit)}
                            </Typography>
                          </div>
                          <Badge variant="outline" className={badge.className}>
                            {badge.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 px-5 pt-0">
                        <BudgetProgressBar progressPercent={budget.progressPercent} status={budget.status} />
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-muted/50 rounded-md p-2.5">
                            <Typography tag="p" className="text-muted-foreground text-[11px]">
                              Остаток
                            </Typography>
                            <Typography
                              tag="p"
                              className={
                                budget.remaining >= 0
                                  ? "text-sm font-semibold text-emerald-600 dark:text-emerald-300"
                                  : "text-destructive text-sm font-semibold"
                              }
                            >
                              {currencyFormatter.format(budget.remaining)}
                            </Typography>
                          </div>
                          <div className="bg-muted/50 rounded-md p-2.5">
                            <Typography tag="p" className="text-muted-foreground text-[11px]">
                              Факт
                            </Typography>
                            <Typography tag="p" className="text-sm font-semibold">
                              {compactCurrencyFormatter.format(budget.spent)}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setEditingBudget(budget)}>
                            <PencilIcon />
                            Редактировать
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setArchivingBudget(budget)}>
                            <Trash2Icon />
                            Архивировать
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="xl:col-span-4">
              <BudgetVsActualChartCard items={budgets} />
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreateError(null);
          }
        }}
      >
        <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-xl">
          <BudgetEditorDialogForm
            form={createForm}
            title="Новый бюджет"
            description="Настрой лимит по категории и сразу увидишь перерасход на странице бюджета."
            monthOptions={createMonthOptions}
            submitLabel="Создать бюджет"
            submitPending={postBudgetMutation.isPending}
            errorMessage={createError}
            onSubmit={onCreateBudget}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingBudget)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBudget(null);
            setEditError(null);
          }
        }}
      >
        <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-xl">
          <BudgetEditorDialogForm
            form={editForm}
            title="Редактировать бюджет"
            description="Измени период, категорию или лимит. Статус на странице пересчитается сразу."
            monthOptions={editMonthOptions}
            submitLabel="Сохранить изменения"
            submitPending={patchBudgetMutation.isPending}
            errorMessage={editError}
            onSubmit={onEditBudget}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(archivingBudget)}
        onOpenChange={(open) => {
          if (!open) {
            setArchivingBudget(null);
            setArchiveError(null);
          }
        }}
      >
        <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-md">
          <div className="border-b bg-muted/35 px-6 py-5">
            <DialogHeader className="gap-1 text-left">
              <DialogTitle>Архивировать бюджет</DialogTitle>
              <DialogDescription>
                Бюджет исчезнет из активного списка, но останется в истории данных.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
              <Typography tag="p" className="text-sm font-semibold">
                {archivingBudget ? BUDGET_TAG_LABELS[archivingBudget.tag] : "Выбранный бюджет"}
              </Typography>
              <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                {archivingBudget
                  ? `${formatMonthLabel(archivingBudget.month)} • лимит ${currencyFormatter.format(archivingBudget.limit)}`
                  : "Этот бюджет исчезнет из активного списка."}
              </Typography>
            </div>
            {archiveError ? <p className="text-destructive text-sm">{archiveError}</p> : null}
          </div>

          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => void onArchiveBudget()}
              disabled={deleteBudgetMutation.isPending}
            >
              Архивировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { Budgets };
