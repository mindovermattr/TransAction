import { getTransactions } from "@/api/requests";
import { useQuery } from "@tanstack/react-query";

export const useGetTransactionsQuery = (
  settings?: QuerySettings<typeof getTransactions>,
) =>
  useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions({ config: settings?.config }),
    ...settings?.options,
  });
