import { deleteIncome, type DeleteIncomeConfig } from "@/api/requests";
import { useMutation } from "@tanstack/react-query";

export const useDeleteIncomeMutation = (
  settings?: MutationSettings<DeleteIncomeConfig, typeof deleteIncome>
) =>
  useMutation({
    mutationKey: ["income", "delete"],
    mutationFn: ({ params, config }) =>
      deleteIncome({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
