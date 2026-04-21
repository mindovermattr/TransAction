import { useGetDashboardOverviewQuery } from "@/api/hooks/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { ArrowDownCircleIcon, BadgePlusIcon, Circle } from "lucide-react";
import { useMemo } from "react";
import { TransactionAddIncomeModal } from "../transactions/ui/modals/transaction-add-income-modal";
import { TransactionAddModal } from "../transactions/ui/modals/transaction-add-modal";
import { DashboardCharts, DashboardLoadingState, DashboardRecentActivityCard, DashboardWidgets } from "./ui";
import { getDashboardCashflowPoints, getDashboardCategoryPoints, getDashboardPeriodCompare } from "./dashboard.utils";

export const Dashboard = () => {
  const { data, isLoading, isFetching, isError, refetch } = useGetDashboardOverviewQuery();

  const cashflowPoints = useMemo(() => getDashboardCashflowPoints(data?.cashflow.months), [data?.cashflow.months]);

  const categoryPoints = useMemo(() => getDashboardCategoryPoints(data?.topCategories), [data?.topCategories]);

  const periodCompare = useMemo(() => getDashboardPeriodCompare(data?.totals), [data?.totals]);

  if (isLoading && !data) {
    return <DashboardLoadingState />;
  }

  if (isError && !data) {
    return (
      <div className="space-y-4 lg:space-y-5">
        <section className="bg-card rounded-xl border p-6">
          <Typography tag="h1" variant="title" className="text-2xl">
            Дашборд
          </Typography>
          <Typography tag="p" className="text-muted-foreground mt-2 text-sm">
            Не удалось загрузить обзор финансов.
          </Typography>
          <Button className="mt-4" onClick={() => void refetch()}>
            Повторить
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <SidebarTrigger className="mt-0.5" />
          <div className="space-y-1">
            <Typography tag="h1" variant="title" className="text-2xl">
              Дашборд
            </Typography>
            <Typography tag="p" className="text-muted-foreground text-sm">
              Главная сводка по доходам, расходам и динамике месяца
            </Typography>
          </div>
        </div>

        <Badge variant="outline" className="gap-1.5 self-start rounded-full px-3 py-1">
          <Circle
            className={
              isFetching ? "h-2.5 w-2.5 fill-amber-500 text-amber-500" : "h-2.5 w-2.5 fill-emerald-500 text-emerald-500"
            }
          />
          {isFetching ? "Обновление" : "Актуально"}
        </Badge>
      </header>

      <section className="bg-card rounded-xl border p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-1">
            <div className="space-y-1">
              <Typography tag="h2" className="text-base font-semibold">
                Быстрые действия
              </Typography>
              <Typography tag="p" className="text-muted-foreground text-sm">
                Добавьте новую запись, чтобы сводка и графики обновились сразу.
              </Typography>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <TransactionAddModal
              triggerLabel="Добавить транзакцию"
              triggerVariant="default"
              triggerSize="default"
              triggerIcon={ArrowDownCircleIcon}
              triggerClassName="shadow-sm sm:min-w-[198px]"
            />
            <TransactionAddIncomeModal
              triggerLabel="Добавить доход"
              triggerVariant="outline"
              triggerSize="default"
              triggerIcon={BadgePlusIcon}
              triggerClassName="sm:min-w-[172px]"
            />
          </div>
        </div>
      </section>

      <DashboardWidgets data={data} />

      <DashboardCharts
        cashflowPoints={cashflowPoints}
        categoryPoints={categoryPoints}
        periodCompare={periodCompare}
        weekdayTotals={data?.weekdayTotals ?? []}
      />

      <DashboardRecentActivityCard data={data?.recentActivity ?? []} />
    </div>
  );
};
