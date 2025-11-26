import { useQuery } from "@tanstack/react-query";
import { getExpensesTrendAnalytics } from "../requests";

export const useGetExpensesTrendQuery = (
  period: AnalyticsPeriod,
  settings?: QuerySettings<typeof getExpensesTrendAnalytics>,
) =>
  useQuery({
    queryKey: ["analytics", "expenses", "trend", period],
    queryFn: () =>
      getExpensesTrendAnalytics({
        params: { period },
        config: settings?.config,
      }),
    ...settings?.options,
  });
