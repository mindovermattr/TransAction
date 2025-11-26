import { useQuery } from "@tanstack/react-query";
import { getBalanceOverviewAnalytics } from "../requests";

export const useGetBalanceOverviewQuery = (
  period: AnalyticsPeriod,
  settings?: QuerySettings<typeof getBalanceOverviewAnalytics>,
) =>
  useQuery({
    queryKey: ["analytics", "balance", "overview", period],
    queryFn: () =>
      getBalanceOverviewAnalytics({
        params: { period },
        config: settings?.config,
      }),
    ...settings?.options,
  });
