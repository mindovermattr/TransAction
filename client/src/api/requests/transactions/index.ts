import { protectedInstance } from "@/api/instance";

export type GetTransactionsConfig = OfetchRequestConfig;
export type TransactionResponse = Transaction[];

export const getTransactions = async (requestConfig?: GetTransactionsConfig) =>
  protectedInstance<TransactionResponse>("transactions", requestConfig?.config);

export type PostTransactionsParams = Omit<Transaction, "userId">;
export type PostTransactionsConfig =
  OfetchRequestConfig<PostTransactionsParams>;

export const postTransaction = async ({
  params,
  config,
}: PostTransactionsConfig) =>
  protectedInstance("transactions", {
    method: "POST",
    body: params,
    ...config,
  });
