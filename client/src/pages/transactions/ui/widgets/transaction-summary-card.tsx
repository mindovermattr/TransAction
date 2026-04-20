import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  CircleDollarSignIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type SummaryCardVariant = "income" | "expense";

type SummaryCardProps = {
  variant: SummaryCardVariant;
  sectionLabel: string;
  title: string;
  currentAmount: number;
  previousAmount: number;
  differencePercent: number;
  action?: ReactNode;
  icon: LucideIcon;
};

type SummaryCardStyle = {
  container: string;
  iconBox: string;
  iconColor: string;
};

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const formatDeltaText = (value: number) =>
  `${Math.abs(value)}% ${value >= 0 ? "выше" : "ниже"}`;

const CARD_STYLES: Record<SummaryCardVariant, SummaryCardStyle> = {
  income: {
    container: "border-emerald-500/20 bg-card",
    iconBox: "bg-emerald-500/14",
    iconColor: "text-emerald-500",
  },
  expense: {
    container: "border-rose-500/20 bg-card",
    iconBox: "bg-rose-500/14",
    iconColor: "text-rose-500",
  },
};

const getDeltaClassName = (variant: SummaryCardVariant, diff: number) => {
  const isPositive = diff >= 0;
  const isGoodTrend = variant === "income" ? isPositive : !isPositive;

  return isGoodTrend
    ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-500"
    : "border-rose-500/30 bg-rose-500/12 text-rose-500";
};

const TransactionSummaryCard = ({
  variant,
  sectionLabel,
  title,
  currentAmount,
  previousAmount,
  differencePercent,
  action,
  icon: Icon,
}: SummaryCardProps) => {
  const styles = CARD_STYLES[variant];

  return (
    <Card className={cn("gap-4 py-5.5", styles.container)}>
      <CardHeader className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className={cn("rounded-lg p-2.5", styles.iconBox, styles.iconColor)}
          >
            <Icon size={18} />
          </div>
          <div className="space-y-0.5">
            <Typography
              tag="p"
              className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
            >
              {sectionLabel}
            </Typography>
            <Typography
              tag="h3"
              variant="title"
              className="text-xl leading-tight font-semibold"
            >
              {title}
            </Typography>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>

      <CardContent className="space-y-3">
        <Typography tag="h3" variant="title" className="text-4xl font-semibold">
          {currencyFormatter.format(currentAmount)}
        </Typography>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <CircleDollarSignIcon className="h-4 w-4" />
          <span>
            За прошлый месяц: {currencyFormatter.format(previousAmount)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="min-h-14 justify-between gap-3">
        <Typography tag="p" className="text-muted-foreground text-sm">
          Динамика к предыдущему месяцу
        </Typography>
        {previousAmount > 0 ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
              getDeltaClassName(variant, differencePercent),
            )}
          >
            {differencePercent >= 0 ? (
              <TrendingUpIcon className="h-3.5 w-3.5" />
            ) : (
              <TrendingDownIcon className="h-3.5 w-3.5" />
            )}
            {formatDeltaText(differencePercent)}
          </span>
        ) : (
          <Typography tag="span" className="text-muted-foreground text-xs">
            Нет данных за прошлый месяц
          </Typography>
        )}
      </CardFooter>
    </Card>
  );
};

export { TransactionSummaryCard };
