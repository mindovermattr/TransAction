import { useGetAccountsQuery } from "@/api/hooks";
import { AppPageHeader } from "@/components/ui/app-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SemanticStatusBadge } from "@/components/ui/semantic-status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { accountGetSchema, ACCOUNT_TYPE_LABELS } from "@/schemas/account.schema";
import {
  SUBSCRIPTION_BILLING_CYCLE_LABELS,
  SUBSCRIPTION_BILLING_CYCLES,
  SUBSCRIPTION_CATEGORY_LABELS,
  SUBSCRIPTION_CATEGORY_TAGS,
  subscriptionFormSchema,
} from "@/schemas/subscription.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BellRingIcon,
  CalendarIcon,
  CircleDollarSignIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  RepeatIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  Wallet2Icon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  FALLBACK_ACCOUNTS,
  createSeedSubscriptions,
  formatNextChargeDate,
  formatSubscriptionCurrency,
  getCategoryDistribution,
  getHeaderSyncLabel,
  getRecurringLoadByAccount,
  getStatusDistribution,
  getSubscriptionsSummary,
  getUpcomingSubscriptions,
  groupUpcomingSubscriptions,
  normalizeMonthlyAmount,
  startOfDay,
  toDateInputValue,
  type SubscriptionAccountOption,
  type SubscriptionRecord,
} from "./subscriptions.utils";

type SubscriptionFormInput = z.input<typeof subscriptionFormSchema>;
type SubscriptionFormValues = z.output<typeof subscriptionFormSchema>;

type TableStatusFilter = "all" | "dueSoon" | "later" | "paused";
type TimelineWindow = 7 | 30;

const SubscriptionsLoadingState = () => (
  <div className="space-y-4 lg:space-y-5">
    <section className="bg-card rounded-xl border p-4 lg:p-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
    </section>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-[148px] rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-[176px] rounded-xl" />
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
      <Skeleton className="h-[440px] rounded-xl" />
      <div className="grid gap-4">
        <Skeleton className="h-[160px] rounded-xl" />
        <Skeleton className="h-[160px] rounded-xl" />
        <Skeleton className="h-[160px] rounded-xl" />
      </div>
    </div>
    <Skeleton className="h-[360px] rounded-xl" />
  </div>
);

const SubscriptionMetricCard = ({
  title,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  tone: "ok" | "warning" | "danger" | "info";
  icon: typeof Wallet2Icon;
}) => (
  <Card className="gap-4 py-5">
    <CardHeader className="px-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-2xl leading-none tracking-tight">{value}</CardTitle>
        </div>
        <div
          className={`rounded-full border p-2.5 ${
            tone === "ok"
              ? "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
              : tone === "warning"
                ? "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300"
                : tone === "danger"
                  ? "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300"
                  : "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-300"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="px-5 pt-0">
      <Typography tag="p" className="text-muted-foreground text-sm">
        {hint}
      </Typography>
    </CardContent>
  </Card>
);

const SubscriptionInsightCard = ({
  title,
  value,
  hint,
  tone,
}: {
  title: string;
  value: string;
  hint: string;
  tone: "ok" | "warning" | "danger" | "info";
}) => (
  <div className="bg-muted/35 rounded-xl border px-4 py-4">
    <div className="flex items-center justify-between gap-3">
      <Typography tag="p" className="text-muted-foreground text-sm">
        {title}
      </Typography>
      <SemanticStatusBadge tone={tone}>{tone === "danger" ? "Риск" : tone === "warning" ? "Скоро" : "Ок"}</SemanticStatusBadge>
    </div>
    <Typography tag="p" className="mt-3 text-lg font-semibold leading-tight">
      {value}
    </Typography>
    <Typography tag="p" className="text-muted-foreground mt-1.5 text-sm">
      {hint}
    </Typography>
  </div>
);

const EmptySubscriptionsState = ({ onCreate }: { onCreate: () => void }) => (
  <Card className="gap-4 py-7">
    <CardHeader className="px-6">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary rounded-2xl p-3">
          <RepeatIcon className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Регулярные списания пока не настроены</CardTitle>
          <CardDescription className="mt-2 max-w-2xl">
            Добавьте Netflix, связь, аренду или другой повторяющийся расход. Страница покажет ближайшую нагрузку, риски и
            monthly recurring total без лишней аналитической перегрузки.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 px-6 pt-0">
      <div className="grid gap-3 md:grid-cols-3">
        {["Netflix", "Мобильная связь", "Аренда квартиры"].map((example) => (
          <div key={example} className="bg-muted/35 rounded-xl border px-4 py-3">
            <Typography tag="p" className="text-sm font-medium">
              {example}
            </Typography>
            <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
              Будет виден в ближайших списаниях и общей recurring-нагрузке.
            </Typography>
          </div>
        ))}
      </div>
      <Button onClick={onCreate}>
        <RepeatIcon className="h-4 w-4" />
        Добавить первую подписку
      </Button>
    </CardContent>
  </Card>
);

const SubscriptionFormDialog = ({
  open,
  onOpenChange,
  accounts,
  initialValues,
  title,
  description,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: SubscriptionAccountOption[];
  initialValues?: SubscriptionRecord | null;
  title: string;
  description: string;
  onSubmit: (values: SubscriptionFormValues) => void;
}) => {
  const form = useForm<SubscriptionFormInput, undefined, SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      billingCycle: "monthly",
      nextChargeDate: toDateInputValue(startOfDay(new Date())),
      categoryTag: "OTHER",
      accountId: accounts[0]?.id ?? 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: initialValues?.name ?? "",
      amount: initialValues?.amount,
      billingCycle: initialValues?.billingCycle ?? "monthly",
      nextChargeDate: initialValues?.nextChargeDate ?? toDateInputValue(startOfDay(new Date())),
      categoryTag: initialValues?.categoryTag ?? "OTHER",
      accountId: initialValues?.accountId ?? accounts[0]?.id ?? 0,
      isActive: initialValues?.isActive ?? true,
    });
  }, [accounts, form, initialValues, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              onSubmit(values);
              onOpenChange(false);
            })}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Netflix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сумма</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        placeholder="1299"
                        value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цикл</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Выберите цикл" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBSCRIPTION_BILLING_CYCLES.map((cycle) => (
                            <SelectItem key={cycle} value={cycle}>
                              {SUBSCRIPTION_BILLING_CYCLE_LABELS[cycle]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nextChargeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата следующего списания</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Счёт</FormLabel>
                    <FormControl>
                      <Select value={String(field.value)} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Выберите счёт" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={String(account.id)}>
                              {account.name} • {ACCOUNT_TYPE_LABELS[account.type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="categoryTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBSCRIPTION_CATEGORY_TAGS.map((category) => (
                            <SelectItem key={category} value={category}>
                              {SUBSCRIPTION_CATEGORY_LABELS[category]}
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
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус</FormLabel>
                    <FormControl>
                      <Select value={String(field.value)} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Активна</SelectItem>
                          <SelectItem value="false">На паузе</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Отмена
                </Button>
              </DialogClose>
              <Button type="submit">{initialValues ? "Сохранить" : "Создать подписку"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const Subscriptions = () => {
  const { data, isLoading, isError } = useGetAccountsQuery(undefined, {
    options: {
      retry: false,
    },
  });

  const parsedAccounts = useMemo(() => {
    return (data ?? [])
      .map((account) => accountGetSchema.safeParse(account))
      .flatMap((result) => (result.success ? [result.data] : []))
      .filter((account) => !account.isArchived)
      .map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        isArchived: account.isArchived,
      }));
  }, [data]);

  const isDemoMode = isError || parsedAccounts.length === 0;
  const accountOptions = isDemoMode ? FALLBACK_ACCOUNTS : parsedAccounts;

  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionRecord | null>(null);
  const [subscriptionToDisable, setSubscriptionToDisable] = useState<SubscriptionRecord | null>(null);
  const [timelineWindow, setTimelineWindow] = useState<TimelineWindow>(30);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TableStatusFilter>("all");
  const [accountFilter, setAccountFilter] = useState<"ALL" | string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | string>("ALL");
  const [cycleFilter, setCycleFilter] = useState<"ALL" | string>("ALL");
  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => {
    if (isHydrated || (isLoading && !data)) {
      return;
    }

    setSubscriptions(isDemoMode ? createSeedSubscriptions(accountOptions) : []);
    setIsHydrated(true);
  }, [accountOptions, data, isDemoMode, isHydrated, isLoading]);

  const summary = useMemo(() => getSubscriptionsSummary(subscriptions), [subscriptions]);
  const syncBadge = useMemo(() => getHeaderSyncLabel(summary, { isDemoMode }), [isDemoMode, summary]);

  const upcomingSubscriptions = useMemo(
    () => getUpcomingSubscriptions(subscriptions, accountOptions, timelineWindow),
    [accountOptions, subscriptions, timelineWindow],
  );
  const upcomingGroups = useMemo(() => groupUpcomingSubscriptions(upcomingSubscriptions), [upcomingSubscriptions]);
  const categoryDistribution = useMemo(() => getCategoryDistribution(subscriptions), [subscriptions]);
  const recurringLoadByAccount = useMemo(
    () => getRecurringLoadByAccount(subscriptions, accountOptions),
    [accountOptions, subscriptions],
  );
  const statusDistribution = useMemo(() => getStatusDistribution(subscriptions), [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((subscription) => {
        const matchesSearch = search.trim().length === 0 || subscription.name.toLowerCase().includes(search.trim().toLowerCase());
        const matchesAccount = accountFilter === "ALL" || String(subscription.accountId) === accountFilter;
        const matchesCategory = categoryFilter === "ALL" || subscription.categoryTag === categoryFilter;
        const matchesCycle = cycleFilter === "ALL" || subscription.billingCycle === cycleFilter;
        const matchesActiveOnly = !activeOnly || subscription.isActive;

        const daysUntil = Math.round(
          (startOfDay(new Date(`${subscription.nextChargeDate}T00:00:00`)).getTime() - startOfDay(new Date()).getTime()) / 86_400_000,
        );

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "paused"
              ? !subscription.isActive
              : statusFilter === "dueSoon"
                ? subscription.isActive && daysUntil <= 7
                : subscription.isActive && daysUntil > 7;

        return matchesSearch && matchesAccount && matchesCategory && matchesCycle && matchesActiveOnly && matchesStatus;
      })
      .sort((left, right) => new Date(left.nextChargeDate).getTime() - new Date(right.nextChargeDate).getTime());
  }, [accountFilter, activeOnly, categoryFilter, cycleFilter, search, statusFilter, subscriptions]);

  const tableAccounts = useMemo(() => new Map(accountOptions.map((account) => [account.id, account])), [accountOptions]);

  if (isLoading && !data) {
    return <SubscriptionsLoadingState />;
  }

  const upsertSubscription = (values: SubscriptionFormValues) => {
    if (editingSubscription) {
      setSubscriptions((current) =>
        current.map((subscription) =>
          subscription.id === editingSubscription.id
            ? {
                ...subscription,
                ...values,
              }
            : subscription,
        ),
      );
      setEditingSubscription(null);
      return;
    }

    setSubscriptions((current) => [
      ...current,
      {
        id: Date.now(),
        ...values,
      },
    ]);
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <AppPageHeader
        title="Подписки"
        description="Регулярные списания, ближайшая нагрузка и контроль автоплатежей"
        rightSlot={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SemanticStatusBadge tone={syncBadge.tone}>{syncBadge.label}</SemanticStatusBadge>
            <Button onClick={() => setIsCreateOpen(true)}>
              <RepeatIcon className="h-4 w-4" />
              Добавить подписку
            </Button>
          </div>
        }
      />

      {isDemoMode ? (
        <Card className="gap-3 border-dashed py-4">
          <CardContent className="px-5">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-2.5">
                <div className="bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 rounded-full p-2">
                  <SparklesIcon className="h-4 w-4" />
                </div>
                <div>
                  <Typography tag="p" className="text-sm font-medium">
                    Локальный режим для демонстрации UX
                  </Typography>
                  <Typography tag="p" className="text-muted-foreground text-sm">
                    Страница работает с локальными примерами, пока для подписок нет backend data layer.
                  </Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {subscriptions.length === 0 ? (
        <EmptySubscriptionsState onCreate={() => setIsCreateOpen(true)} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SubscriptionMetricCard
              title="Recurring в месяц"
              value={formatSubscriptionCurrency(summary.monthlyRecurringTotal)}
              hint={
                summary.riskCount > 0 ? `${summary.riskCount} риска: крупная сумма или близкая дата` : "Нагрузка нормализована в месячный эквивалент"
              }
              tone="info"
              icon={CircleDollarSignIcon}
            />
            <SubscriptionMetricCard
              title="Ближайшие 7 дней"
              value={formatSubscriptionCurrency(summary.dueSoonAmount)}
              hint={`${summary.dueSoonCount} списаний до конца недели`}
              tone={summary.dueSoonCount > 0 ? "warning" : "ok"}
              icon={BellRingIcon}
            />
            <SubscriptionMetricCard
              title="Активные подписки"
              value={String(summary.activeCount)}
              hint={`${statusDistribution.paused} на паузе и не создают новые списания`}
              tone="ok"
              icon={RepeatIcon}
            />
            <SubscriptionMetricCard
              title="Годовая доля"
              value={`${summary.yearlyNormalizedShare}%`}
              hint="Годовые планы учтены как помесячная нагрузка"
              tone="info"
              icon={CalendarIcon}
            />
          </div>

          <Card className="gap-4 py-5">
            <CardHeader className="px-5">
              <CardTitle>Что важно сейчас</CardTitle>
              <CardDescription>Сигналы по ближайшим списаниям и общей recurring-нагрузке</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pt-0 lg:grid-cols-3">
              <SubscriptionInsightCard
                title="Ближайшее списание"
                value={summary.nearestCharge ? summary.nearestCharge.name : "Нет активных подписок"}
                hint={
                  summary.nearestCharge
                    ? `${formatNextChargeDate(summary.nearestCharge.nextChargeDate)} • ${formatSubscriptionCurrency(summary.nearestCharge.amount)}`
                    : "Добавьте первую регулярную трату"
                }
                tone={summary.nearestCharge ? (summary.dueSoonCount > 0 ? "warning" : "ok") : "info"}
              />
              <SubscriptionInsightCard
                title="Самое крупное списание"
                value={summary.biggestUpcoming ? summary.biggestUpcoming.name : "Нет крупных платежей"}
                hint={
                  summary.biggestUpcoming
                    ? `${formatSubscriptionCurrency(summary.biggestUpcoming.amount)} • ${formatNextChargeDate(summary.biggestUpcoming.nextChargeDate)}`
                    : "В ближайшие 30 дней критичных списаний нет"
                }
                tone={summary.biggestUpcoming ? "danger" : "ok"}
              />
              <SubscriptionInsightCard
                title="Перегруженная категория"
                value={summary.overloadedCategory ? summary.overloadedCategory.label : "Нет данных"}
                hint={
                  summary.overloadedCategory
                    ? `${formatSubscriptionCurrency(summary.overloadedCategory.total)} в месяц • ${summary.overloadedCategory.count} подписки`
                    : "В ближайшие 7 дней критичных списаний нет"
                }
                tone={summary.overloadedCategory ? "warning" : "ok"}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
            <Card className="gap-4 py-5">
              <CardHeader className="px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Ближайшие списания</CardTitle>
                    <CardDescription>Следующие {timelineWindow} дней</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={timelineWindow === 7 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimelineWindow(7)}
                    >
                      7 дней
                    </Button>
                    <Button
                      variant={timelineWindow === 30 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimelineWindow(30)}
                    >
                      30 дней
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pt-0">
                {upcomingGroups.length === 0 ? (
                  <div className="bg-muted/35 rounded-xl border border-dashed px-4 py-10 text-center">
                    <CalendarIcon className="text-muted-foreground mx-auto h-8 w-8" />
                    <Typography tag="p" className="mt-4 text-base font-semibold">
                      Нет ближайших списаний
                    </Typography>
                    <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                      Добавьте первую подписку, чтобы видеть нагрузку на ближайшие дни.
                    </Typography>
                    <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                      Добавить первую подписку
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingGroups.map((group) => (
                      <div key={group.label} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <SemanticStatusBadge tone={group.label === "Просрочено" ? "danger" : group.label === "Сегодня" ? "warning" : "info"}>
                            {group.label}
                          </SemanticStatusBadge>
                          <Typography tag="p" className="text-muted-foreground text-xs">
                            {group.items.length} {group.items.length === 1 ? "запись" : group.items.length < 5 ? "записи" : "записей"}
                          </Typography>
                        </div>
                        <div className="space-y-2">
                          {group.items.map((subscription) => {
                            const Icon = subscription.icon;
                            return (
                              <button
                                key={subscription.id}
                                type="button"
                                onClick={() => setEditingSubscription(subscription)}
                                className="bg-muted/35 hover:bg-muted/55 flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
                              >
                                <div className="bg-background text-primary mt-0.5 rounded-full border p-2">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <Typography tag="p" className="truncate text-sm font-semibold">
                                        {subscription.name}
                                      </Typography>
                                      <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                                        {subscription.dueLabel}
                                      </Typography>
                                    </div>
                                    <Typography tag="p" className="text-base font-semibold whitespace-nowrap">
                                      {formatSubscriptionCurrency(subscription.amount)}
                                    </Typography>
                                  </div>
                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <SemanticStatusBadge tone={subscription.dueStatus.tone}>{subscription.dueStatus.label}</SemanticStatusBadge>
                                    <SemanticStatusBadge tone="info">{subscription.account.name}</SemanticStatusBadge>
                                    <SemanticStatusBadge tone="ok">{subscription.categoryLabel}</SemanticStatusBadge>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card className="gap-4 py-5">
                <CardHeader className="px-5">
                  <CardTitle>По категориям</CardTitle>
                  <CardDescription>Топ recurring-нагрузки по месячному эквиваленту</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-5 pt-0">
                  {categoryDistribution.length === 0 ? (
                    <Typography tag="p" className="text-muted-foreground text-sm">
                      Нет активных подписок для разбивки по категориям.
                    </Typography>
                  ) : (
                    categoryDistribution.map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <Typography tag="p" className="text-sm font-medium">
                            {item.label}
                          </Typography>
                          <Typography tag="p" className="text-muted-foreground text-sm">
                            {formatSubscriptionCurrency(item.total)}
                          </Typography>
                        </div>
                        <div className="bg-muted h-2 rounded-full">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${summary.monthlyRecurringTotal > 0 ? Math.max((item.total / summary.monthlyRecurringTotal) * 100, 8) : 0}%`,
                              backgroundColor: item.fill,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="gap-4 py-5">
                <CardHeader className="px-5">
                  <CardTitle>Recurring load</CardTitle>
                  <CardDescription>Нагрузка по счетам и циклам оплаты</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-5 pt-0">
                  {recurringLoadByAccount.length === 0 ? (
                    <Typography tag="p" className="text-muted-foreground text-sm">
                      Пока нет активных recurring-списаний.
                    </Typography>
                  ) : (
                    recurringLoadByAccount.map((item) => (
                      <div key={item.accountId} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <Typography tag="p" className="text-sm font-medium">
                            {item.label}
                          </Typography>
                          <Typography tag="p" className="text-muted-foreground text-sm">
                            {formatSubscriptionCurrency(item.total)} • {item.percent}%
                          </Typography>
                        </div>
                        <div className="bg-muted h-2 rounded-full">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.max(item.percent, 6)}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="gap-4 py-5">
                <CardHeader className="px-5">
                  <CardTitle>Статусы</CardTitle>
                  <CardDescription>Активность и краткосрочный риск по подпискам</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 px-5 pt-0">
                  {[
                    {
                      label: "Активные",
                      value: statusDistribution.active,
                      tone: "ok" as const,
                    },
                    {
                      label: "На паузе",
                      value: statusDistribution.paused,
                      tone: "info" as const,
                    },
                    {
                      label: "Скоро",
                      value: statusDistribution.dueSoon,
                      tone: "warning" as const,
                    },
                    {
                      label: "Позже",
                      value: statusDistribution.later,
                      tone: "ok" as const,
                    },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/35 flex items-center justify-between rounded-xl border px-3 py-3">
                      <Typography tag="p" className="text-sm font-medium">
                        {item.label}
                      </Typography>
                      <SemanticStatusBadge tone={item.tone}>{item.value}</SemanticStatusBadge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="gap-4 py-5">
            <CardHeader className="px-5">
              <div className="flex flex-col gap-3">
                <div>
                  <CardTitle>Все подписки</CardTitle>
                  <CardDescription>Редактирование, пауза, смена счёта и даты списания</CardDescription>
                </div>
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.8fr))_auto]">
                  <div className="relative">
                    <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Поиск по названию" />
                  </div>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TableStatusFilter)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="dueSoon">Скоро</SelectItem>
                      <SelectItem value="later">Позже</SelectItem>
                      <SelectItem value="paused">На паузе</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={accountFilter} onValueChange={setAccountFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Счёт" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Все счета</SelectItem>
                      {accountOptions.map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Все категории</SelectItem>
                      {SUBSCRIPTION_CATEGORY_TAGS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {SUBSCRIPTION_CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={cycleFilter} onValueChange={setCycleFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Цикл" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Все циклы</SelectItem>
                      {SUBSCRIPTION_BILLING_CYCLES.map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>
                          {SUBSCRIPTION_BILLING_CYCLE_LABELS[cycle]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant={activeOnly ? "default" : "outline"} onClick={() => setActiveOnly((current) => !current)}>
                    Только активные
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-0">
              {filteredSubscriptions.length === 0 ? (
                <div className="bg-muted/35 rounded-xl border border-dashed px-4 py-10 text-center">
                  <SearchIcon className="text-muted-foreground mx-auto h-8 w-8" />
                  <Typography tag="p" className="mt-4 text-base font-semibold">
                    Нет подписок по текущим фильтрам
                  </Typography>
                  <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
                    Сбросьте фильтры или добавьте новую подписку.
                  </Typography>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Цикл</TableHead>
                      <TableHead>Следующее списание</TableHead>
                      <TableHead>Счёт</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => {
                      const account = tableAccounts.get(subscription.accountId) ?? FALLBACK_ACCOUNTS[0];
                      const status = subscription.isActive
                        ? subscription.nextChargeDate <= toDateInputValue(startOfDay(new Date()))
                          ? { label: "Сегодня", tone: "danger" as const }
                          : new Date(`${subscription.nextChargeDate}T00:00:00`).getTime() - startOfDay(new Date()).getTime() <=
                                7 * 86_400_000
                            ? { label: "Скоро", tone: "warning" as const }
                            : { label: "Позже", tone: "ok" as const }
                        : { label: "Пауза", tone: "info" as const };

                      return (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="min-w-[180px]">
                              <Typography tag="p" className="text-sm font-medium">
                                {subscription.name}
                              </Typography>
                              <Typography tag="p" className="text-muted-foreground text-xs">
                                {subscription.billingCycle === "yearly"
                                  ? `Годовая подписка, учтена как ${formatSubscriptionCurrency(normalizeMonthlyAmount(subscription))}/мес`
                                  : "Ежемесячное списание"}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>{formatSubscriptionCurrency(subscription.amount)}</TableCell>
                          <TableCell>{SUBSCRIPTION_BILLING_CYCLE_LABELS[subscription.billingCycle]}</TableCell>
                          <TableCell>
                            <div className="min-w-[128px]">
                              <Typography tag="p" className="text-sm font-medium">
                                {formatNextChargeDate(subscription.nextChargeDate)}
                              </Typography>
                              <Typography tag="p" className="text-muted-foreground text-xs">
                                {subscription.nextChargeDate <= toDateInputValue(startOfDay(new Date()))
                                  ? "Спишется сегодня"
                                  : subscription.nextChargeDate}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell>{SUBSCRIPTION_CATEGORY_LABELS[subscription.categoryTag]}</TableCell>
                          <TableCell>
                            <SemanticStatusBadge tone={status.tone}>{status.label}</SemanticStatusBadge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setEditingSubscription(subscription)}>
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setSubscriptions((current) =>
                                    current.map((item) =>
                                      item.id === subscription.id
                                        ? {
                                            ...item,
                                            isActive: !item.isActive,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                              >
                                {subscription.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setSubscriptionToDisable(subscription)}>
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <SubscriptionFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        accounts={accountOptions}
        title="Новая подписка"
        description="Списания появятся в recurring-нагрузке и ближайшем таймлайне"
        onSubmit={upsertSubscription}
      />

      <SubscriptionFormDialog
        open={Boolean(editingSubscription)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSubscription(null);
          }
        }}
        accounts={accountOptions}
        initialValues={editingSubscription}
        title="Редактировать подписку"
        description="Измените дату, счёт, категорию или переведите подписку на паузу"
        onSubmit={upsertSubscription}
      />

      <Dialog open={Boolean(subscriptionToDisable)} onOpenChange={(open) => !open && setSubscriptionToDisable(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Отключить подписку?</DialogTitle>
            <DialogDescription>
              Будущие автосписания остановятся, история останется в журнале. Позже подписку можно вернуть из таблицы.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Отмена
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (!subscriptionToDisable) return;

                setSubscriptions((current) =>
                  current.map((subscription) =>
                    subscription.id === subscriptionToDisable.id
                      ? {
                          ...subscription,
                          isActive: false,
                        }
                      : subscription,
                  ),
                );
                setSubscriptionToDisable(null);
              }}
            >
              Отключить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
