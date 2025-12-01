import { useQuery } from "@tanstack/react-query";
import { getIncomeSummary } from "../../requests";

export const useGetIncomeSummaryQuery = (
  settings?: QuerySettings<typeof getIncomeSummary>,
) =>
  useQuery({
    queryKey: ["income", "summary"],
    queryFn: () => getIncomeSummary({ config: settings?.config }),
    ...settings?.options,
  });
