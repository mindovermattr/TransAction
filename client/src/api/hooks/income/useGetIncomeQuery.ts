import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getIncome } from "@/api/requests";
import type { IncomeListParams } from "@/api/requests/income";

export const useGetIncomeQuery = (
  params?: IncomeListParams,
  settings?: QuerySettings<typeof getIncome>,
) =>
  useQuery({
    queryKey: ["income", params],
    queryFn: () => getIncome({ params, config: settings?.config }),
    placeholderData: keepPreviousData,
    ...settings?.options,
  });
