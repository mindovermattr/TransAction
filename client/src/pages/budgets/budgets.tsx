import {
  useDeleteBudgetMutation,
  useGetBudgetsQuery,
  usePatchBudgetMutation,
  usePostBudgetMutation,
} from "@/api/hooks";
import { queryClient } from "@/api/query-client";
import { AppPageHeader } from "@/components/ui/app-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { budgetsResponseSchema, budgetPostSchema } from "@/schemas/budget.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  currentMonthValue,
  getApiErrorMessage,
  getBudgetAlertCard,
  getBudgetMonthOptions,
  type BudgetFormInput,
  type BudgetFormValues,
  sortBudgets,
} from "./lib";
import {
  BudgetAlertCard,
  BudgetArchiveDialog,
  BudgetCreateDialog,
  BudgetEditDialog,
  BudgetEmptyState,
  BudgetMobileList,
  BudgetPageHeaderActions,
  BudgetSummaryCards,
  BudgetTable,
  BudgetVsActualChartCard,
} from "./ui";

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
  const budgets = useMemo(() => sortBudgets(parsedData?.items ?? []), [parsedData?.items]);

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
      queryClient.invalidateQueries({ queryKey: ["budgets"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] }),
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

  const summary = useMemo(
    () =>
      parsedData?.summary ?? {
        totalLimit: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overCount: 0,
        warningCount: 0,
        activeCount: 0,
      },
    [parsedData?.summary],
  );

  const createMonthOptions = useMemo(() => getBudgetMonthOptions(selectedMonth), [selectedMonth]);
  const editMonthOptions = useMemo(
    () => getBudgetMonthOptions(editingBudget?.month ?? selectedMonth),
    [editingBudget?.month, selectedMonth],
  );

  const primaryBudget = budgets[0] ?? null;
  const alertCard = useMemo(() => getBudgetAlertCard({ primaryBudget, summary }), [primaryBudget, summary]);

  if (isLoading && !parsedData) {
    return (
      <div className="space-y-4 lg:space-y-5">
        <AppPageHeader title="Бюджеты" description="Лимиты по категориям на выбранный месяц" />
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
            <BudgetPageHeaderActions
              loadingError
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onCreateClick={() => setCreateOpen(true)}
            />
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
            <BudgetPageHeaderActions
              isFetching={isFetching}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onCreateClick={() => setCreateOpen(true)}
            />
          }
        />

        <BudgetSummaryCards summary={summary} />
        <BudgetAlertCard {...alertCard} />

        {budgets.length === 0 ? (
          <BudgetEmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <BudgetTable budgets={budgets} onEdit={setEditingBudget} onArchive={setArchivingBudget} />
              <BudgetMobileList budgets={budgets} onEdit={setEditingBudget} onArchive={setArchivingBudget} />
            </div>

            <div className="xl:col-span-4">
              <BudgetVsActualChartCard items={budgets} />
            </div>
          </div>
        )}
      </div>

      <BudgetCreateDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreateError(null);
          }
        }}
        form={createForm}
        monthOptions={createMonthOptions}
        submitPending={postBudgetMutation.isPending}
        errorMessage={createError}
        onSubmit={onCreateBudget}
      />

      <BudgetEditDialog
        open={Boolean(editingBudget)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBudget(null);
            setEditError(null);
          }
        }}
        form={editForm}
        monthOptions={editMonthOptions}
        submitPending={patchBudgetMutation.isPending}
        errorMessage={editError}
        onSubmit={onEditBudget}
      />

      <BudgetArchiveDialog
        budget={archivingBudget}
        open={Boolean(archivingBudget)}
        onOpenChange={(open) => {
          if (!open) {
            setArchivingBudget(null);
            setArchiveError(null);
          }
        }}
        errorMessage={archiveError}
        submitPending={deleteBudgetMutation.isPending}
        onConfirm={() => void onArchiveBudget()}
      />
    </>
  );
};

export { Budgets };
