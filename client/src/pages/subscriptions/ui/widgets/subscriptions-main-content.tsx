import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SemanticStatusBadge } from "@/components/ui/semantic-status-badge";
import { Typography } from "@/components/ui/typography";
import { formatRubCurrency } from "@/lib/formatters";
import type { SubscriptionRecord } from "@/schemas/subscription.schema";
import type {
  CategoryDistributionItem,
  RecurringLoadItem,
  StatusDistribution,
  SubscriptionsSummary,
  UpcomingSubscriptionGroup,
} from "../../lib";
import type { TimelineWindow } from "../../lib";
import { CalendarIcon } from "lucide-react";

const SubscriptionsMainContent = ({
  categoryDistribution,
  onCreate,
  onEdit,
  recurringLoadByAccount,
  statusDistribution,
  summary,
  timelineWindow,
  upcomingGroups,
  onTimelineWindowChange,
}: {
  categoryDistribution: CategoryDistributionItem[];
  onCreate: () => void;
  onEdit: (subscription: SubscriptionRecord) => void;
  recurringLoadByAccount: RecurringLoadItem[];
  statusDistribution: StatusDistribution;
  summary: SubscriptionsSummary;
  timelineWindow: TimelineWindow;
  upcomingGroups: UpcomingSubscriptionGroup[];
  onTimelineWindowChange: (window: TimelineWindow) => void;
}) => (
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
              onClick={() => onTimelineWindowChange(7)}
            >
              7 дней
            </Button>
            <Button
              variant={timelineWindow === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => onTimelineWindowChange(30)}
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
            <Button className="mt-4" onClick={onCreate}>
              Добавить первую подписку
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <SemanticStatusBadge
                    tone={group.label === "Просрочено" ? "danger" : group.label === "Сегодня" ? "warning" : "info"}
                  >
                    {group.label}
                  </SemanticStatusBadge>
                  <Typography tag="p" className="text-muted-foreground text-xs">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "запись" : group.items.length < 5 ? "записи" : "записей"}
                  </Typography>
                </div>
                <div className="space-y-2">
                  {group.items.map((subscription) => {
                    const Icon = subscription.icon;

                    return (
                      <button
                        key={subscription.id}
                        type="button"
                        onClick={() => onEdit(subscription)}
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
                              {formatRubCurrency(subscription.amount)}
                            </Typography>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <SemanticStatusBadge tone={subscription.dueStatus.tone}>
                              {subscription.dueStatus.label}
                            </SemanticStatusBadge>
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
                    {formatRubCurrency(item.total)}
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
                    {formatRubCurrency(item.total)} • {item.percent}%
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
            { label: "Активные", value: statusDistribution.active, tone: "ok" as const },
            { label: "На паузе", value: statusDistribution.paused, tone: "info" as const },
            { label: "Скоро", value: statusDistribution.dueSoon, tone: "warning" as const },
            { label: "Позже", value: statusDistribution.later, tone: "ok" as const },
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
);

export { SubscriptionsMainContent };
