import { patchBudget, type PatchBudgetConfig } from "@/api/requests/budgets";
import { useMutation } from "@tanstack/react-query";

export const usePatchBudgetMutation = (
  settings?: MutationSettings<PatchBudgetConfig, typeof patchBudget>,
) =>
  useMutation({
    mutationKey: ["budgets"],
    mutationFn: ({ params, config }) =>
      patchBudget({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
