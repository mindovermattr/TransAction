import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/api/requests";
import type { TransactionListParams } from "@/api/requests/transactions";

export const useGetTransactionsQuery = (
  params?: TransactionListParams,
  settings?: QuerySettings<typeof getTransactions>,
) =>
  useQuery({
    queryKey: ["transactions", params],
    queryFn: () => getTransactions({ params, config: settings?.config }),
    placeholderData: keepPreviousData,
    ...settings?.options,
  });
