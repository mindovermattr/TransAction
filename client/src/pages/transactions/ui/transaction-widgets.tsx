import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { BanknoteArrowDownIcon, Wallet2Icon } from "lucide-react";

interface TransactionWidgetsProps {
  isFetching: boolean;
}

const TransactionWidgets = ({ isFetching }: TransactionWidgetsProps) => {
  if (isFetching) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="min-h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Card className="grow">
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
      <Card className="grow">
        <CardHeader className="flex items-center">
          <BanknoteArrowDownIcon size={22} />
          <Typography tag="h3" variant="title" className="font-medium">
            Сумма транзакций за месяц
          </Typography>
        </CardHeader>
        <CardContent>
          <Typography tag="h3" variant="title" className="text-3xl font-medium">
            123 000 руб
          </Typography>
        </CardContent>
        <CardFooter>
          <Typography tag="p" className="text-sm">
            На{" "}
            <Typography tag="span" className="text-sm text-rose-500">
              12% больше{" "}
            </Typography>
            чем в предыдущем месяце
          </Typography>
        </CardFooter>
      </Card>
    </div>
  );
};

export { TransactionWidgets };
