import {
  deleteAccount,
  type DeleteAccountConfig,
} from "@/api/requests/accounts";
import { useMutation } from "@tanstack/react-query";

export const useDeleteAccountMutation = (
  settings?: MutationSettings<DeleteAccountConfig, typeof deleteAccount>,
) =>
  useMutation({
    mutationKey: ["accounts"],
    mutationFn: ({ params, config }) =>
      deleteAccount({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
