import { getAccounts } from "@/api/requests";
import type { GetAccountsParams } from "@/api/requests/accounts";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetAccountsQuery = (params?: GetAccountsParams, settings?: QuerySettings<typeof getAccounts>) =>
  useQuery({
    queryKey: ["accounts", params],
    queryFn: () => getAccounts({ params, config: settings?.config }),
    placeholderData: keepPreviousData,
    ...settings?.options,
  });
