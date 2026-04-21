import { getDashboardOverview } from "@/api/requests/dashboard";
import { useQuery } from "@tanstack/react-query";

export const useGetDashboardOverviewQuery = (settings?: QuerySettings<typeof getDashboardOverview>) =>
  useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => getDashboardOverview({ config: settings?.config }),
    ...settings?.options,
  });
