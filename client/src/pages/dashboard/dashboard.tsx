import { useGetDashboardOverviewQuery } from "@/api/hooks/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import { Circle } from "lucide-react";
import { useMemo } from "react";
import { TransactionAddIncomeModal } from "../transactions/ui/modals/transaction-add-income-modal";
import { TransactionAddModal } from "../transactions/ui/modals/transaction-add-modal";
import {
  DashboardCharts,
  DashboardLoadingState,
  DashboardRecentActivityCard,
  DashboardWidgets,
} from "./ui";
import {
  getDashboardCashflowPoints,
  getDashboardCategoryPoints,
  getDashboardPeriodCompare,
} from "./dashboard.utils";

export const Dashboard = () => {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetDashboardOverviewQuery();

  const cashflowPoints = useMemo(
    () => getDashboardCashflowPoints(data?.cashflow.months),
    [data?.cashflow.months],
  );

  const categoryPoints = useMemo(
    () => getDashboardCategoryPoints(data?.topCategories),
    [data?.topCategories],
  );

  const periodCompare = useMemo(
    () => getDashboardPeriodCompare(data?.totals),
    [data?.totals],
  );

  if (isLoading && !data) {
    return <DashboardLoadingState />;
  }

  if (isError && !data) {
    return (
      <div className="space-y-4 lg:space-y-5">
        <section className="rounded-xl border bg-card p-6">
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
      <section className="rounded-xl border bg-card p-4 lg:p-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2.5">
            <SidebarTrigger />
            <div className="space-y-1">
              <Typography tag="h1" variant="title" className="text-2xl">
                Дашборд
              </Typography>
              <Typography tag="p" className="text-muted-foreground text-sm">
                Главная сводка по доходам, расходам и динамике месяца
              </Typography>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <Circle
                className={
                  isFetching
                    ? "h-2.5 w-2.5 fill-amber-500 text-amber-500"
                    : "h-2.5 w-2.5 fill-emerald-500 text-emerald-500"
                }
              />
              {isFetching ? "Обновление" : "Актуально"}
            </Badge>

            <div className="flex items-center gap-2">
              <TransactionAddModal />
              <TransactionAddIncomeModal />
            </div>
          </div>
        </header>
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
