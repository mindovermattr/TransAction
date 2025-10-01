import { protectedInstance } from "@/api/instance";

export type GetTransactionsSummaryConfig = OfetchRequestConfig;

export type TransactionSummaryResponse = {
  _sum: {
    price: number;
  };
};

export const getTransactionsSummary = (
  requestConfig?: GetTransactionsSummaryConfig,
) =>
  protectedInstance<TransactionSummaryResponse>(
    "transactions/summary",
    requestConfig?.config,
  );
