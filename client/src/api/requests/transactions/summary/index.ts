import { protectedInstance } from "@/api/instance";

export type GetTransactionsSummaryConfig = OfetchRequestConfig;

export type TransactionSummaryResponse = {
  currentMonthSum: number | null;
  prevMonthSum: number | null;
};

export const getTransactionsSummary = (
  requestConfig?: GetTransactionsSummaryConfig,
) =>
  protectedInstance<TransactionSummaryResponse>(
    "transactions/summary",
    requestConfig?.config,
  );
