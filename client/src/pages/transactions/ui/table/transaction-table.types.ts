import { transactionGetSchema } from "@/schemas/transaction.schema";

type TransactionRow = ReturnType<typeof transactionGetSchema.parse>;

type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

type DatePreset = "all" | "thisMonth" | "last30" | "last90" | "custom";

type TransactionFiltersState = {
  search: string;
  tag: "ALL" | TransactionTags;
  minAmount: string;
  maxAmount: string;
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
};

type NormalizedTransactionFilters = {
  search: string;
  tag: TransactionFiltersState["tag"];
  minAmount?: number;
  maxAmount?: number;
  from?: Date;
  to?: Date;
};

type FiltersPatch = Partial<TransactionFiltersState>;

export type {
  DatePreset,
  FiltersPatch,
  NormalizedTransactionFilters,
  PaginationState,
  TransactionFiltersState,
  TransactionRow,
};
