import { useGetTransactionsSummaryQuery } from "@/api/hooks";
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

const TransactionWidgets = () => {
  const { data, isLoading } = useGetTransactionsSummaryQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="min-h-42.5" />
        ))}
      </div>
    );
  }

  if (!data) return;

  const prevMonthSum = data.prevMonthSum ?? 1;
  const currentMonthSum = data.currentMonthSum ?? 0;

  const diff = Math.round(
    ((currentMonthSum - prevMonthSum) / prevMonthSum) * 100,
  );
  const isDifferencePositive = diff >= 100;

  const formattedCurrentMonthSum = Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(currentMonthSum);

  return (
    <div className="flex gap-4">
      <Card className="grow gap-4">
        <CardHeader className="flex items-center">
          <Wallet2Icon size={18} />
          <Typography tag="h3" variant="title" className="font-medium">
            Ваша прибыль
          </Typography>
        </CardHeader>
        <CardContent>
          <Typography tag="h3" variant="title" className="text-3xl font-medium">
            123 000 руб
          </Typography>
        </CardContent>
        <CardFooter>
          <Typography tag="p" className="text-sm">
            <Typography tag="span" className="text-sm text-emerald-300">
              12%{" "}
            </Typography>
            в сравнении с прошлым месяцем
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
            {data.prevMonthSum ? (
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
            )}
          </Typography>
        </CardFooter>
      </Card>
    </div>
  );
};

export { TransactionWidgets };
