import { useQuery } from "@tanstack/react-query";
import { getExpensesByCategoryAnalytics } from "../requests";

export const useGetExpensesByCategoryQuery = (
  period: AnalyticsPeriod,
  settings?: QuerySettings<typeof getExpensesByCategoryAnalytics>,
) =>
  useQuery({
    queryKey: ["analytics", "expenses", "by-category", period],
    queryFn: () =>
      getExpensesByCategoryAnalytics({
        params: { period },
        config: settings?.config,
      }),
    ...settings?.options,
  });
