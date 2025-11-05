import { getIncome } from "@/api/requests";
import { useQuery } from "@tanstack/react-query";

export const useGetIncomeQuery = (settings?: QuerySettings<typeof getIncome>) =>
  useQuery({
    queryKey: ["income"],
    queryFn: () => getIncome({ config: settings?.config }),
    ...settings?.options,
  });
