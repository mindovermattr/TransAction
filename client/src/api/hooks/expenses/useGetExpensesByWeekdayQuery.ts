import { useQuery } from "@tanstack/react-query";
import { getExpensesByWeekdayAnalytics } from "../../requests";

export const useGetExpensesByWeekdayQuery = (
  period: AnalyticsPeriod,
  settings?: QuerySettings<typeof getExpensesByWeekdayAnalytics>,
) =>
  useQuery({
    queryKey: ["analytics", "expenses", "weekday", period],
    queryFn: () =>
      getExpensesByWeekdayAnalytics({
        params: { period },
        config: settings?.config,
      }),
    ...settings?.options,
  });
