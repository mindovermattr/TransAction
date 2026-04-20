import { patchTransaction, type PatchTransactionsConfig } from "@/api/requests";
import { useMutation } from "@tanstack/react-query";

export const usePatchTransactionMutation = (
  settings?: MutationSettings<PatchTransactionsConfig, typeof patchTransaction>,
) =>
  useMutation({
    mutationKey: ["transactions", "patch"],
    mutationFn: ({ params, config }) =>
      patchTransaction({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
