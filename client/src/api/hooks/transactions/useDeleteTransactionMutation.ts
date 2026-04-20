import {
  deleteTransaction,
  type DeleteTransactionConfig,
} from "@/api/requests";
import { useMutation } from "@tanstack/react-query";

export const useDeleteTransactionMutation = (
  settings?: MutationSettings<
    DeleteTransactionConfig,
    typeof deleteTransaction
  >,
) =>
  useMutation({
    mutationKey: ["transactions", "delete"],
    mutationFn: ({ params, config }) =>
      deleteTransaction({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
