import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SemanticStatusBadge } from "@/components/ui/semantic-status-badge";
import { Typography } from "@/components/ui/typography";
import { formatRubCurrency } from "@/lib/formatters";
import { formatNextChargeDate, type StatusDistribution, type SubscriptionsSummary } from "../../lib";
import { BellRingIcon, CalendarIcon, CircleDollarSignIcon, RepeatIcon, Wallet2Icon } from "lucide-react";

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
      <SemanticStatusBadge tone={tone}>
        {tone === "danger" ? "Риск" : tone === "warning" ? "Скоро" : "Ок"}
      </SemanticStatusBadge>
    </div>
    <Typography tag="p" className="mt-3 text-lg leading-tight font-semibold">
      {value}
    </Typography>
    <Typography tag="p" className="text-muted-foreground mt-1.5 text-sm">
      {hint}
    </Typography>
  </div>
);

const SubscriptionsOverview = ({
  summary,
  statusDistribution,
}: {
  summary: SubscriptionsSummary;
  statusDistribution: StatusDistribution;
}) => (
  <>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SubscriptionMetricCard
        title="Recurring в месяц"
        value={formatRubCurrency(summary.monthlyRecurringTotal)}
        hint={
          summary.riskCount > 0
            ? `${summary.riskCount} риска: крупная сумма или близкая дата`
            : "Нагрузка нормализована в месячный эквивалент"
        }
        tone="info"
        icon={CircleDollarSignIcon}
      />
      <SubscriptionMetricCard
        title="Ближайшие 7 дней"
        value={formatRubCurrency(summary.dueSoonAmount)}
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
              ? `${formatNextChargeDate(summary.nearestCharge.nextChargeDate)} • ${formatRubCurrency(summary.nearestCharge.amount)}`
              : "Добавьте первую регулярную трату"
          }
          tone={summary.nearestCharge ? (summary.dueSoonCount > 0 ? "warning" : "ok") : "info"}
        />
        <SubscriptionInsightCard
          title="Самое крупное списание"
          value={summary.biggestUpcoming ? summary.biggestUpcoming.name : "Нет крупных платежей"}
          hint={
            summary.biggestUpcoming
              ? `${formatRubCurrency(summary.biggestUpcoming.amount)} • ${formatNextChargeDate(summary.biggestUpcoming.nextChargeDate)}`
              : "В ближайшие 30 дней критичных списаний нет"
          }
          tone={summary.biggestUpcoming ? "danger" : "ok"}
        />
        <SubscriptionInsightCard
          title="Перегруженная категория"
          value={summary.overloadedCategory ? summary.overloadedCategory.label : "Нет данных"}
          hint={
            summary.overloadedCategory
              ? `${formatRubCurrency(summary.overloadedCategory.total)} в месяц • ${summary.overloadedCategory.count} подписки`
              : "В ближайшие 7 дней критичных списаний нет"
          }
          tone={summary.overloadedCategory ? "warning" : "ok"}
        />
      </CardContent>
    </Card>
  </>
);

export { SubscriptionsOverview };
