import { useGetAccountsQuery } from "@/api/hooks";
import { accountGetSchema } from "@/schemas/account.schema";
import type { SubscriptionFormValues, SubscriptionRecord } from "@/schemas/subscription.schema";
import { useEffect, useMemo, useState } from "react";
import type { SubscriptionsTableFilters, TimelineWindow } from "./subscriptions.types";
import {
  FALLBACK_ACCOUNTS,
  createSeedSubscriptions,
  getCategoryDistribution,
  getHeaderSyncLabel,
  getRecurringLoadByAccount,
  getStatusDistribution,
  getSubscriptionsSummary,
  getUpcomingSubscriptions,
  groupUpcomingSubscriptions,
  startOfDay,
  type SubscriptionAccountOption,
} from "./subscriptions.utils";

const defaultFilters: SubscriptionsTableFilters = {
  search: "",
  statusFilter: "all",
  accountFilter: "ALL",
  categoryFilter: "ALL",
  cycleFilter: "ALL",
  activeOnly: true,
};

const useSubscriptionsState = () => {
  const { data, isLoading, isError } = useGetAccountsQuery(undefined, {
    options: {
      retry: false,
    },
  });

  const parsedAccounts = useMemo(() => {
    return (data ?? [])
      .map((account) => accountGetSchema.safeParse(account))
      .flatMap((result) => (result.success ? [result.data] : []))
      .filter((account) => !account.isArchived)
      .map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        isArchived: account.isArchived,
      }));
  }, [data]);

  const isDemoMode = isError || parsedAccounts.length === 0;
  const accountOptions = isDemoMode ? FALLBACK_ACCOUNTS : parsedAccounts;

  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionRecord | null>(null);
  const [subscriptionToDisable, setSubscriptionToDisable] = useState<SubscriptionRecord | null>(null);
  const [timelineWindow, setTimelineWindow] = useState<TimelineWindow>(30);
  const [filters, setFilters] = useState<SubscriptionsTableFilters>(defaultFilters);

  useEffect(() => {
    if (isHydrated || (isLoading && !data)) {
      return;
    }

    setSubscriptions(isDemoMode ? createSeedSubscriptions(accountOptions) : []);
    setIsHydrated(true);
  }, [accountOptions, data, isDemoMode, isHydrated, isLoading]);

  const summary = useMemo(() => getSubscriptionsSummary(subscriptions), [subscriptions]);
  const syncBadge = useMemo(() => getHeaderSyncLabel(summary, { isDemoMode }), [isDemoMode, summary]);
  const upcomingSubscriptions = useMemo(
    () => getUpcomingSubscriptions(subscriptions, accountOptions, timelineWindow),
    [accountOptions, subscriptions, timelineWindow],
  );
  const upcomingGroups = useMemo(() => groupUpcomingSubscriptions(upcomingSubscriptions), [upcomingSubscriptions]);
  const categoryDistribution = useMemo(() => getCategoryDistribution(subscriptions), [subscriptions]);
  const recurringLoadByAccount = useMemo(
    () => getRecurringLoadByAccount(subscriptions, accountOptions),
    [accountOptions, subscriptions],
  );
  const statusDistribution = useMemo(() => getStatusDistribution(subscriptions), [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((subscription) => {
        const matchesSearch =
          filters.search.trim().length === 0 || subscription.name.toLowerCase().includes(filters.search.trim().toLowerCase());
        const matchesAccount = filters.accountFilter === "ALL" || String(subscription.accountId) === filters.accountFilter;
        const matchesCategory = filters.categoryFilter === "ALL" || subscription.categoryTag === filters.categoryFilter;
        const matchesCycle = filters.cycleFilter === "ALL" || subscription.billingCycle === filters.cycleFilter;
        const matchesActiveOnly = !filters.activeOnly || subscription.isActive;

        const daysUntil = Math.round(
          (startOfDay(new Date(`${subscription.nextChargeDate}T00:00:00`)).getTime() - startOfDay(new Date()).getTime()) / 86_400_000,
        );

        const matchesStatus =
          filters.statusFilter === "all"
            ? true
            : filters.statusFilter === "paused"
              ? !subscription.isActive
              : filters.statusFilter === "dueSoon"
                ? subscription.isActive && daysUntil <= 7
                : subscription.isActive && daysUntil > 7;

        return matchesSearch && matchesAccount && matchesCategory && matchesCycle && matchesActiveOnly && matchesStatus;
      })
      .sort((left, right) => new Date(left.nextChargeDate).getTime() - new Date(right.nextChargeDate).getTime());
  }, [filters, subscriptions]);

  const tableAccounts = useMemo(() => new Map(accountOptions.map((account) => [account.id, account])), [accountOptions]);

  const upsertSubscription = (values: SubscriptionFormValues) => {
    if (editingSubscription) {
      setSubscriptions((current) =>
        current.map((subscription) =>
          subscription.id === editingSubscription.id
            ? {
                ...subscription,
                ...values,
              }
            : subscription,
        ),
      );
      setEditingSubscription(null);
      return;
    }

    setSubscriptions((current) => [
      ...current,
      {
        id: Date.now(),
        ...values,
      },
    ]);
  };

  const toggleSubscriptionActive = (subscriptionId: number) => {
    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.id === subscriptionId
          ? {
              ...subscription,
              isActive: !subscription.isActive,
            }
          : subscription,
      ),
    );
  };

  const disableSubscription = (subscriptionId: number) => {
    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.id === subscriptionId
          ? {
              ...subscription,
              isActive: false,
            }
          : subscription,
      ),
    );
    setSubscriptionToDisable(null);
  };

  const updateFilters = (patch: Partial<SubscriptionsTableFilters>) => {
    setFilters((current) => ({
      ...current,
      ...patch,
    }));
  };

  return {
    accountOptions,
    categoryDistribution,
    editingSubscription,
    filteredSubscriptions,
    filters,
    isCreateOpen,
    isDemoMode,
    isInitialLoading: isLoading && !data,
    recurringLoadByAccount,
    statusDistribution,
    subscriptionToDisable,
    subscriptions,
    summary,
    syncBadge,
    tableAccounts,
    timelineWindow,
    upcomingGroups,
    disableSubscription,
    setEditingSubscription,
    setIsCreateOpen,
    setSubscriptionToDisable,
    setTimelineWindow,
    toggleSubscriptionActive,
    updateFilters,
    upsertSubscription,
  };
};

export { useSubscriptionsState };
export type { SubscriptionAccountOption };
