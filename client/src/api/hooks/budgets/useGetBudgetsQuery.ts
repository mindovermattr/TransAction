import { getBudgets } from "@/api/requests";
import type { GetBudgetsParams } from "@/api/requests/budgets";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetBudgetsQuery = (
  params?: GetBudgetsParams,
  settings?: QuerySettings<typeof getBudgets>,
) =>
  useQuery({
    queryKey: ["budgets", params],
    queryFn: () => getBudgets({ params, config: settings?.config }),
    placeholderData: keepPreviousData,
    ...settings?.options,
  });
