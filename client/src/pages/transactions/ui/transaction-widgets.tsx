import { useGetTransactionsSummaryQuery } from "@/api/hooks";
import { useGetIncomeSummaryQuery } from "@/api/hooks/income/useGetIncomeSummaryQuery";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  BanknoteArrowDownIcon,
  CircleDollarSignIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  Wallet2Icon,
} from "lucide-react";
import { TransactionAddIncomeModal } from "./transaction-add-income-modal";

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const formatDeltaText = (value: number) =>
  `${Math.abs(value)}% ${value >= 0 ? "выше" : "ниже"}`;

const TransactionWidgets = () => {
  const { data, isLoading } = useGetTransactionsSummaryQuery();
  const { data: incomeData, isLoading: isIncomeLoading } =
    useGetIncomeSummaryQuery();

  if (isLoading || isIncomeLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="min-h-[204px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || !incomeData) return null;

  const prevMonthSum = data.prevMonthSum ?? 0;
  const currentMonthSum = data.currentMonthSum ?? 0;

  const prevMonthIncomeSum = incomeData.prevMonthSum ?? 0;
  const currentMonthIncomeSum = incomeData.currentMonthSum ?? 0;

  const incomeDiff =
    prevMonthIncomeSum > 0
      ? Math.round(
          ((currentMonthIncomeSum - prevMonthIncomeSum) / prevMonthIncomeSum) *
            100,
        )
      : 0;

  const diff =
    prevMonthSum > 0
      ? Math.round(((currentMonthSum - prevMonthSum) / prevMonthSum) * 100)
      : 0;

  const isDifferencePositive = diff >= 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="from-emerald-500/8 to-card gap-4 border-emerald-500/20 bg-gradient-to-br py-5.5">
        <CardHeader className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/14 text-emerald-500 rounded-lg p-2.5">
              <Wallet2Icon size={18} />
            </div>
            <div className="space-y-0.5">
              <Typography
                tag="p"
                className="text-muted-foreground text-xs font-medium uppercase tracking-wide"
              >
                Доходы
              </Typography>
              <Typography
                tag="h3"
                variant="title"
                className="text-xl leading-tight font-semibold"
              >
                Поступления за месяц
              </Typography>
            </div>
          </div>
          <div className="shrink-0">
            <TransactionAddIncomeModal />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <Typography tag="h3" variant="title" className="text-4xl font-semibold">
            {currencyFormatter.format(currentMonthIncomeSum)}
          </Typography>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CircleDollarSignIcon className="h-4 w-4" />
            <span>
              За прошлый месяц: {currencyFormatter.format(prevMonthIncomeSum)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="min-h-14 justify-between gap-3">
          <Typography tag="p" className="text-muted-foreground text-sm">
            Динамика к предыдущему месяцу
          </Typography>
          {prevMonthIncomeSum > 0 ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                incomeDiff >= 0
                  ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-500"
                  : "border-rose-500/30 bg-rose-500/12 text-rose-500",
              )}
            >
              {incomeDiff >= 0 ? (
                <TrendingUpIcon className="h-3.5 w-3.5" />
              ) : (
                <TrendingDownIcon className="h-3.5 w-3.5" />
              )}
              {formatDeltaText(incomeDiff)}
            </span>
          ) : (
            <Typography tag="span" className="text-muted-foreground text-xs">
              Нет данных за прошлый месяц
            </Typography>
          )}
        </CardFooter>
      </Card>

      <Card className="from-rose-500/8 to-card gap-4 border-rose-500/20 bg-gradient-to-br py-5.5">
        <CardHeader className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-rose-500/14 text-rose-500 rounded-lg p-2.5">
              <BanknoteArrowDownIcon size={18} />
            </div>
            <div className="space-y-0.5">
              <Typography
                tag="p"
                className="text-muted-foreground text-xs font-medium uppercase tracking-wide"
              >
                Расходы
              </Typography>
              <Typography
                tag="h3"
                variant="title"
                className="text-xl leading-tight font-semibold"
              >
                Траты за месяц
              </Typography>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <Typography tag="h3" variant="title" className="text-4xl font-semibold">
            {currencyFormatter.format(currentMonthSum)}
          </Typography>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CircleDollarSignIcon className="h-4 w-4" />
            <span>За прошлый месяц: {currencyFormatter.format(prevMonthSum)}</span>
          </div>
        </CardContent>

        <CardFooter className="min-h-14 justify-between gap-3">
          <Typography tag="p" className="text-muted-foreground text-sm">
            Динамика к предыдущему месяцу
          </Typography>
          {prevMonthSum > 0 ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                isDifferencePositive
                  ? "border-rose-500/30 bg-rose-500/12 text-rose-500"
                  : "border-emerald-500/30 bg-emerald-500/12 text-emerald-500",
              )}
            >
              {isDifferencePositive ? (
                <TrendingUpIcon className="h-3.5 w-3.5" />
              ) : (
                <TrendingDownIcon className="h-3.5 w-3.5" />
              )}
              {formatDeltaText(diff)}
            </span>
          ) : (
            <Typography tag="span" className="text-muted-foreground text-xs">
              Нет данных за прошлый месяц
            </Typography>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export { TransactionWidgets };
