import { protectedInstance } from "@/api/instance";

export type GetTransactionsConfig = OfetchRequestConfig<
  { page: number; limit: number } | undefined
>;
export type TransactionResponse = Omit<Transaction, "date"> & {
  date: string;
};

export const getTransactions = async (requestConfig?: GetTransactionsConfig) =>
  protectedInstance<TransactionResponse[]>(
    "transactions",
    requestConfig?.config,
  );

export type TransactionPaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedTransactionResponse = {
  transactions: TransactionResponse[];
  pagination: PaginationMeta;
};

export const getTransactionsWithPagination = async (
  params: TransactionPaginationParams,
  requestConfig?: GetTransactionsConfig,
) =>
  protectedInstance<PaginatedTransactionResponse>(
    `transactions?page=${params.page}&limit=${params.limit}`,
    requestConfig?.config,
  );

export type PostTransactionsParams = Omit<
  Transaction,
  "userId" | "createdAt" | "updatedAt" | "id" | "date"
> & {
  date: string;
};
export type PostTransactionsConfig =
  OfetchRequestConfig<PostTransactionsParams>;

export const postTransaction = async ({
  params,
  config,
}: PostTransactionsConfig) =>
  protectedInstance<TransactionResponse>("transactions", {
    method: "POST",
    body: params,
    ...config,
  });
