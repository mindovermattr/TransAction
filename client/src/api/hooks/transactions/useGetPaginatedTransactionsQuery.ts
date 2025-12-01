import { useQuery } from "@tanstack/react-query";
import {
  getTransactionsWithPagination,
  type TransactionPaginationParams,
} from "../../requests";

export const useGetPaginatedTransactionsQuery = (
  params: TransactionPaginationParams,
  settings?: QuerySettings<typeof getTransactionsWithPagination>,
) =>
  useQuery({
    queryKey: ["transactions", params.page],
    queryFn: () =>
      getTransactionsWithPagination(params, { config: settings?.config }),
    ...settings?.options,
  });
