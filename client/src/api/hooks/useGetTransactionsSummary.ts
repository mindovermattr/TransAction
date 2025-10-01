import { getTransactionsSummary } from "@/api/requests";
import { useQuery } from "@tanstack/react-query";

export const useGetTransactionsSummaryQuery = (
  settings?: QuerySettings<typeof getTransactionsSummary>,
) =>
  useQuery({
    queryKey: ["transactions/summary"],
    queryFn: () => getTransactionsSummary({ config: settings?.config }),
    ...settings?.options,
  });
