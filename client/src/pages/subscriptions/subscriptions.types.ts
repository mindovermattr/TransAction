type TableStatusFilter = "all" | "dueSoon" | "later" | "paused";
type TimelineWindow = 7 | 30;

type SubscriptionsTableFilters = {
  search: string;
  statusFilter: TableStatusFilter;
  accountFilter: "ALL" | string;
  categoryFilter: "ALL" | string;
  cycleFilter: "ALL" | string;
  activeOnly: boolean;
};

export type { SubscriptionsTableFilters, TableStatusFilter, TimelineWindow };
