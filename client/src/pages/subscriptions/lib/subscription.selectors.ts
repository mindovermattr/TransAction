import { TRANSACTION_TAGS_ICONS } from "@/constants/transaction-tags-icons";
import {
  SUBSCRIPTION_BILLING_CYCLE_LABELS,
  SUBSCRIPTION_CATEGORY_LABELS,
  type SubscriptionRecord,
} from "@/schemas/subscription.schema";
import { getDaysUntil } from "@/lib/date";
import {
  FALLBACK_ACCOUNTS,
  SUBSCRIPTION_CATEGORY_COLORS,
  type SubscriptionAccountOption,
} from "./subscription.constants";
import { getRelativeDueLabel, subscriptionDateFormatter } from "./subscription.formatters";

type DueStatus = {
  label: string;
  tone: "ok" | "warning" | "danger" | "info";
};

const normalizeMonthlyAmount = (subscription: Pick<SubscriptionRecord, "amount" | "billingCycle">) =>
  subscription.billingCycle === "yearly" ? Math.round(subscription.amount / 12) : subscription.amount;

const getDueStatus = (subscription: SubscriptionRecord): DueStatus => {
  if (!subscription.isActive) {
    return {
      label: "Пауза",
      tone: "info",
    };
  }

  const daysUntil = getDaysUntil(subscription.nextChargeDate);

  if (daysUntil < 0) {
    return {
      label: "Просрочено",
      tone: "danger",
    };
  }

  if (daysUntil === 0) {
    return {
      label: "Сегодня",
      tone: "danger",
    };
  }

  if (daysUntil <= 7) {
    return {
      label: "Скоро",
      tone: "warning",
    };
  }

  return {
    label: "Позже",
    tone: "ok",
  };
};

const getTimelineGroupLabel = (dateValue: string) => {
  const daysUntil = getDaysUntil(dateValue);

  if (daysUntil < 0) {
    return "Просрочено";
  }

  if (daysUntil === 0) {
    return "Сегодня";
  }

  if (daysUntil === 1) {
    return "Завтра";
  }

  if (daysUntil <= 7) {
    return "На этой неделе";
  }

  return subscriptionDateFormatter.format(new Date(`${dateValue}T00:00:00`));
};

const getUpcomingSubscriptions = (
  subscriptions: SubscriptionRecord[],
  accounts: SubscriptionAccountOption[],
  dueWindowDays: number,
) => {
  const accountsById = new Map(accounts.map((account) => [account.id, account]));

  return subscriptions
    .filter((subscription) => subscription.isActive)
    .filter((subscription) => getDaysUntil(subscription.nextChargeDate) <= dueWindowDays)
    .sort((left, right) => new Date(left.nextChargeDate).getTime() - new Date(right.nextChargeDate).getTime())
    .map((subscription) => {
      const account = accountsById.get(subscription.accountId) ?? FALLBACK_ACCOUNTS[0];

      return {
        ...subscription,
        account,
        categoryLabel: SUBSCRIPTION_CATEGORY_LABELS[subscription.categoryTag],
        cycleLabel: SUBSCRIPTION_BILLING_CYCLE_LABELS[subscription.billingCycle],
        dueLabel: getRelativeDueLabel(subscription.nextChargeDate),
        dueStatus: getDueStatus(subscription),
        icon: TRANSACTION_TAGS_ICONS[subscription.categoryTag],
      };
    });
};

const groupUpcomingSubscriptions = (subscriptions: ReturnType<typeof getUpcomingSubscriptions>) => {
  const groups = new Map<string, typeof subscriptions>();

  subscriptions.forEach((subscription) => {
    const label = getTimelineGroupLabel(subscription.nextChargeDate);
    const existing = groups.get(label);

    if (existing) {
      existing.push(subscription);
      return;
    }

    groups.set(label, [subscription]);
  });

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }));
};

const getCategoryDistribution = (subscriptions: SubscriptionRecord[]) => {
  const totals = new Map<
    SubscriptionRecord["categoryTag"],
    {
      total: number;
      count: number;
    }
  >();

  subscriptions
    .filter((subscription) => subscription.isActive)
    .forEach((subscription) => {
      const current = totals.get(subscription.categoryTag) ?? { total: 0, count: 0 };
      totals.set(subscription.categoryTag, {
        total: current.total + normalizeMonthlyAmount(subscription),
        count: current.count + 1,
      });
    });

  const sorted = Array.from(totals.entries())
    .map(([categoryTag, item], index) => ({
      categoryTag,
      label: SUBSCRIPTION_CATEGORY_LABELS[categoryTag],
      total: item.total,
      count: item.count,
      fill: SUBSCRIPTION_CATEGORY_COLORS[index % SUBSCRIPTION_CATEGORY_COLORS.length],
    }))
    .sort((left, right) => right.total - left.total);

  if (sorted.length <= 4) {
    return sorted;
  }

  const other = sorted.slice(4).reduce(
    (accumulator, item) => ({
      total: accumulator.total + item.total,
      count: accumulator.count + item.count,
    }),
    { total: 0, count: 0 },
  );

  return [
    ...sorted.slice(0, 4),
    {
      categoryTag: "OTHER" as const,
      label: "Остальные",
      total: other.total,
      count: other.count,
      fill: "var(--color-muted-foreground)",
    },
  ];
};

const getRecurringLoadByAccount = (subscriptions: SubscriptionRecord[], accounts: SubscriptionAccountOption[]) => {
  const total = subscriptions
    .filter((subscription) => subscription.isActive)
    .reduce((sum, subscription) => sum + normalizeMonthlyAmount(subscription), 0);

  const accountTotals = new Map<number, number>();

  subscriptions
    .filter((subscription) => subscription.isActive)
    .forEach((subscription) => {
      accountTotals.set(
        subscription.accountId,
        (accountTotals.get(subscription.accountId) ?? 0) + normalizeMonthlyAmount(subscription),
      );
    });

  return accounts
    .map((account) => {
      const amount = accountTotals.get(account.id) ?? 0;

      return {
        accountId: account.id,
        label: account.name,
        total: amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    })
    .filter((account) => account.total > 0)
    .sort((left, right) => right.total - left.total);
};

const getStatusDistribution = (subscriptions: SubscriptionRecord[]) => {
  const active = subscriptions.filter((subscription) => subscription.isActive);

  return {
    active: active.length,
    paused: subscriptions.length - active.length,
    dueSoon: active.filter((subscription) => getDaysUntil(subscription.nextChargeDate) <= 7).length,
    later: active.filter((subscription) => getDaysUntil(subscription.nextChargeDate) > 7).length,
  };
};

const getSubscriptionsSummary = (subscriptions: SubscriptionRecord[]) => {
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.isActive);
  const dueSoon = activeSubscriptions.filter((subscription) => getDaysUntil(subscription.nextChargeDate) <= 7);
  const upcomingThirty = activeSubscriptions.filter((subscription) => getDaysUntil(subscription.nextChargeDate) <= 30);

  const monthlyRecurringTotal = activeSubscriptions.reduce(
    (sum, subscription) => sum + normalizeMonthlyAmount(subscription),
    0,
  );
  const yearlyNormalizedTotal = activeSubscriptions
    .filter((subscription) => subscription.billingCycle === "yearly")
    .reduce((sum, subscription) => sum + normalizeMonthlyAmount(subscription), 0);

  const categoryDistribution = getCategoryDistribution(activeSubscriptions);

  return {
    monthlyRecurringTotal,
    dueSoonCount: dueSoon.length,
    dueSoonAmount: dueSoon.reduce((sum, subscription) => sum + subscription.amount, 0),
    activeCount: activeSubscriptions.length,
    yearlyNormalizedShare:
      monthlyRecurringTotal > 0 ? Math.round((yearlyNormalizedTotal / monthlyRecurringTotal) * 100) : 0,
    riskCount: dueSoon.filter(
      (subscription) => getDaysUntil(subscription.nextChargeDate) <= 1 || subscription.amount >= 5000,
    ).length,
    nearestCharge:
      upcomingThirty.sort(
        (left, right) => new Date(left.nextChargeDate).getTime() - new Date(right.nextChargeDate).getTime(),
      )[0] ?? null,
    biggestUpcoming: upcomingThirty.sort((left, right) => right.amount - left.amount)[0] ?? null,
    overloadedCategory: categoryDistribution[0] ?? null,
  };
};

const getHeaderSyncLabel = (
  summary: ReturnType<typeof getSubscriptionsSummary>,
  options: {
    isDemoMode: boolean;
  },
) => {
  if (options.isDemoMode) {
    return {
      label: "Демо режим",
      tone: "info" as const,
    };
  }

  if (summary.dueSoonCount > 0) {
    return {
      label: "Есть новые списания",
      tone: "warning" as const,
    };
  }

  return {
    label: "Автосписания синхронизированы",
    tone: "ok" as const,
  };
};

type UpcomingSubscription = ReturnType<typeof getUpcomingSubscriptions>[number];
type UpcomingSubscriptionGroup = ReturnType<typeof groupUpcomingSubscriptions>[number];
type CategoryDistributionItem = ReturnType<typeof getCategoryDistribution>[number];
type RecurringLoadItem = ReturnType<typeof getRecurringLoadByAccount>[number];
type StatusDistribution = ReturnType<typeof getStatusDistribution>;
type SubscriptionsSummary = ReturnType<typeof getSubscriptionsSummary>;

export {
  getCategoryDistribution,
  getDueStatus,
  getHeaderSyncLabel,
  getRecurringLoadByAccount,
  getStatusDistribution,
  getSubscriptionsSummary,
  getUpcomingSubscriptions,
  groupUpcomingSubscriptions,
  normalizeMonthlyAmount,
};
export type {
  CategoryDistributionItem,
  DueStatus,
  RecurringLoadItem,
  StatusDistribution,
  SubscriptionsSummary,
  UpcomingSubscription,
  UpcomingSubscriptionGroup,
};
