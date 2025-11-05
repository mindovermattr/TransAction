import { postIncome, type PostIncomeConfig } from "@/api/requests";
import { useMutation } from "@tanstack/react-query";

export const usePostIncomeMutation = (
  settings?: MutationSettings<PostIncomeConfig, typeof postIncome>,
) =>
  useMutation({
    mutationKey: ["income"],
    mutationFn: ({ params, config }) =>
      postIncome({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
