import { patchIncome, type PatchIncomeConfig } from "@/api/requests";
import { useMutation } from "@tanstack/react-query";

export const usePatchIncomeMutation = (
  settings?: MutationSettings<PatchIncomeConfig, typeof patchIncome>,
) =>
  useMutation({
    mutationKey: ["income", "patch"],
    mutationFn: ({ params, config }) =>
      patchIncome({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
