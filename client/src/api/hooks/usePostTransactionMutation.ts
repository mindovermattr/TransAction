import { postTransaction, type PostTransactionsConfig } from "@/api/requests";
import { useMutation } from "@tanstack/react-query";

export const usePostTransactionsMutation = (
  settings?: MutationSettings<PostTransactionsConfig, typeof postTransaction>,
) =>
  useMutation({
    mutationKey: ["transactions"],
    mutationFn: ({ params, config }) =>
      postTransaction({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
