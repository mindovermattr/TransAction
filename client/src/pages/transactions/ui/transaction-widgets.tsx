import { useGetTransactionsSummaryQuery } from "@/api/hooks";
import { useGetIncomeSummaryQuery } from "@/api/hooks/useGetIncomeSummaryQuery";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { BanknoteArrowDownIcon, Wallet2Icon } from "lucide-react";
import { TransactionAddIncomeModal } from "./transaction-add-income-modal";

const TransactionWidgets = () => {
  const { data, isLoading } = useGetTransactionsSummaryQuery();
  const { data: incomeData, isLoading: isIncomeLoading } =
    useGetIncomeSummaryQuery();

  if (isLoading || isIncomeLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="min-h-42.5" />
        ))}
      </div>
    );
  }

  if (!data || !incomeData) return;

  const prevMonthSum = data.prevMonthSum ?? 1;
  const currentMonthSum = data.currentMonthSum ?? 0;

  const prevMonthIncomeSum = incomeData.prevMonthSum ?? 0;
  const currentMonthIncomeSum = incomeData.currentMonthSum ?? 0;

  const formatter = Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  });

  const incomeDiff =
    prevMonthIncomeSum > 0
      ? Math.round(
          ((currentMonthIncomeSum - prevMonthIncomeSum) / prevMonthIncomeSum) *
            100,
        )
      : 0;

  const diff = Math.round(
    ((currentMonthSum - prevMonthSum) / prevMonthSum) * 100,
  );

  const isDifferencePositive = diff >= 100;

  const formattedCurrentMonthSum = formatter.format(currentMonthSum);

  return (
    <div className="flex gap-4">
      <Card className="grow gap-4">
        <CardHeader className="flex items-center">
          <Wallet2Icon size={18} />
          <Typography tag="h3" variant="title" className="font-medium">
            Ваша прибыль
          </Typography>
          <TransactionAddIncomeModal />
        </CardHeader>
        <CardContent>
          <Typography tag="h3" variant="title" className="text-3xl font-medium">
            {currentMonthIncomeSum > 0
              ? formatter.format(currentMonthIncomeSum)
              : "0 ₽"}
          </Typography>
        </CardContent>
        <CardFooter>
          <Typography tag="p" className="text-sm">
            {prevMonthIncomeSum > 0 ? (
              <>
                На{" "}
                <Typography
                  tag="span"
                  className={cn("text-sm text-rose-500", {
                    "text-emerald-300": incomeDiff >= 0,
                  })}
                >
                  {Math.abs(incomeDiff)}%{" "}
                  {incomeDiff >= 0 ? "больше " : "меньше "}
                </Typography>
                чем в предыдущем месяце
              </>
            ) : currentMonthIncomeSum > 0 ? (
              "В системе не обнаружено доходов за прошлый месяц"
            ) : (
              "У вас пока нет доходов за этот месяц"
            )}
          </Typography>
        </CardFooter>
      </Card>
      <Card className="grow gap-4">
        <CardHeader className="flex items-center">
          <BanknoteArrowDownIcon size={22} />
          <Typography tag="h3" variant="title" className="font-medium">
            Сумма транзакций за месяц
          </Typography>
        </CardHeader>
        <CardContent>
          <Typography tag="h3" variant="title" className="text-3xl font-medium">
            {formattedCurrentMonthSum}
          </Typography>
        </CardContent>
        <CardFooter>
          <Typography tag="p" className="text-sm">
            {currentMonthSum > 0 ? (
              data.prevMonthSum ? (
                <>
                  На{" "}
                  <Typography
                    tag="span"
                    className={cn("text-sm text-rose-500", {
                      "text-emerald-300": isDifferencePositive,
                    })}
                  >
                    {diff}% {isDifferencePositive ? "меньше " : "больше "}
                  </Typography>
                  чем в предыдущем месяце
                </>
              ) : (
                "В системе не обнаружено расходов за прошлый месяц"
              )
            ) : (
              "У вас пока нет транзакций за этот месяц"
            )}
          </Typography>
        </CardFooter>
      </Card>
    </div>
  );
};

export { TransactionWidgets };
