import { protectedInstance } from "@/api/instance";

export type TransactionResponse = Omit<Transaction, "date"> & {
  date: string;
};

type SortOrder = "asc" | "desc";
type TransactionSortBy = "date" | "price" | "name" | "createdAt";

export type TransactionListParams = {
  search?: string;
  tag?: TransactionTags | "ALL";
  accountId?: number;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: TransactionSortBy;
  sortOrder?: SortOrder;
};

export type GetTransactionsConfig = OfetchRequestConfig<TransactionListParams, "json", true>;

export type PaginatedTransactionResponse = {
  items: TransactionResponse[];
  pagination: PaginationMeta;
};

const normalizeParams = (params?: TransactionListParams) => {
  if (!params) return undefined;
  return {
    ...params,
    tag: params.tag === "ALL" ? undefined : params.tag,
  };
};

export const getTransactions = (requestConfig?: GetTransactionsConfig) =>
  protectedInstance<PaginatedTransactionResponse>("transactions", {
    query: normalizeParams(requestConfig?.params),
    ...requestConfig?.config,
  });

export type PostTransactionsParams = Omit<
  Transaction,
  "userId" | "createdAt" | "updatedAt" | "id" | "date" | "account"
> & {
  date: string;
};
export type PostTransactionsConfig = OfetchRequestConfig<PostTransactionsParams>;

export const postTransaction = ({ params, config }: PostTransactionsConfig) =>
  protectedInstance<TransactionResponse>("transactions", {
    method: "POST",
    body: params,
    ...config,
  });

export type PatchTransactionsParams = Partial<PostTransactionsParams>;
export type PatchTransactionsConfig = OfetchRequestConfig<{
  id: number;
  data: PatchTransactionsParams;
}>;

export const patchTransaction = ({ params, config }: PatchTransactionsConfig) =>
  protectedInstance<TransactionResponse>(`transactions/${params.id}`, {
    method: "PATCH",
    body: params.data,
    ...config,
  });

export type DeleteTransactionConfig = OfetchRequestConfig<{ id: number }>;

export const deleteTransaction = ({ params, config }: DeleteTransactionConfig) =>
  protectedInstance<{ success: boolean }>(`transactions/${params.id}`, {
    method: "DELETE",
    ...config,
  });
