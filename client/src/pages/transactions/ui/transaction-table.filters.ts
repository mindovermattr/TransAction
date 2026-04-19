import type {
  DatePreset,
  FiltersPatch,
  NormalizedTransactionFilters,
  TransactionFiltersState,
  TransactionRow,
} from "./transaction-table.types";

const DEFAULT_FILTERS: TransactionFiltersState = {
  search: "",
  tag: "ALL",
  minAmount: "",
  maxAmount: "",
  datePreset: "all",
  dateFrom: "",
  dateTo: "",
};

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: "Все даты", value: "all" },
  { label: "Этот месяц", value: "thisMonth" },
  { label: "Последние 30 дней", value: "last30" },
  { label: "Последние 90 дней", value: "last90" },
  { label: "Пользовательский", value: "custom" },
];

const getPresetRange = (preset: DatePreset) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  if (preset === "thisMonth") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: undefined,
    };
  }

  if (preset === "last30") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 29);
    return { from, to: undefined };
  }

  if (preset === "last90") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 89);
    return { from, to: undefined };
  }

  return { from: undefined, to: undefined };
};

const parseOptionalAmount = (value: string) => {
  if (value === "") return undefined;

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeCustomDateRange = (filters: TransactionFiltersState) => {
  const from = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
  const to = filters.dateTo ? new Date(filters.dateTo) : undefined;

  if (to) {
    to.setHours(23, 59, 59, 999);
  }

  return { from, to };
};

const normalizeFilters = (
  filters: TransactionFiltersState,
): NormalizedTransactionFilters => {
  const minAmount = parseOptionalAmount(filters.minAmount);
  const maxAmount = parseOptionalAmount(filters.maxAmount);

  const dateRange =
    filters.datePreset === "custom"
      ? normalizeCustomDateRange(filters)
      : getPresetRange(filters.datePreset);

  return {
    search: filters.search.trim().toLowerCase(),
    tag: filters.tag,
    minAmount,
    maxAmount,
    ...dateRange,
  };
};

const matchesTransactionFilters = (
  transaction: TransactionRow,
  filters: NormalizedTransactionFilters,
) => {
  if (filters.search && !transaction.name.toLowerCase().includes(filters.search)) {
    return false;
  }

  if (filters.tag !== "ALL" && transaction.tag !== filters.tag) {
    return false;
  }

  if (
    typeof filters.minAmount === "number" &&
    transaction.price < filters.minAmount
  ) {
    return false;
  }

  if (
    typeof filters.maxAmount === "number" &&
    transaction.price > filters.maxAmount
  ) {
    return false;
  }

  const transactionTimestamp = transaction.date.getTime();

  if (filters.from && transactionTimestamp < filters.from.getTime()) {
    return false;
  }

  if (filters.to && transactionTimestamp > filters.to.getTime()) {
    return false;
  }

  return true;
};

const hasActiveFilters = (filters: TransactionFiltersState) =>
  filters.search.length > 0 ||
  filters.tag !== "ALL" ||
  filters.minAmount.length > 0 ||
  filters.maxAmount.length > 0 ||
  filters.datePreset !== "all" ||
  filters.dateFrom.length > 0 ||
  filters.dateTo.length > 0;

const getDatePresetPatch = (
  preset: DatePreset,
  previous: TransactionFiltersState,
): FiltersPatch => ({
  datePreset: preset,
  dateFrom: preset === "custom" ? previous.dateFrom : "",
  dateTo: preset === "custom" ? previous.dateTo : "",
});

export {
  DATE_PRESETS,
  DEFAULT_FILTERS,
  getDatePresetPatch,
  hasActiveFilters,
  matchesTransactionFilters,
  normalizeFilters,
};
