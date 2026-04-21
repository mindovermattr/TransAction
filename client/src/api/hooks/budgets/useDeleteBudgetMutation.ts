import { deleteBudget, type DeleteBudgetConfig } from "@/api/requests/budgets";
import { useMutation } from "@tanstack/react-query";

export const useDeleteBudgetMutation = (
  settings?: MutationSettings<DeleteBudgetConfig, typeof deleteBudget>,
) =>
  useMutation({
    mutationKey: ["budgets"],
    mutationFn: ({ params, config }) =>
      deleteBudget({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
