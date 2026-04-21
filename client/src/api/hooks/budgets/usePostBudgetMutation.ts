import { postBudget, type PostBudgetConfig } from "@/api/requests/budgets";
import { useMutation } from "@tanstack/react-query";

export const usePostBudgetMutation = (
  settings?: MutationSettings<PostBudgetConfig, typeof postBudget>,
) =>
  useMutation({
    mutationKey: ["budgets"],
    mutationFn: ({ params, config }) =>
      postBudget({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
