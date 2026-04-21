import { postAccount, type PostAccountConfig } from "@/api/requests/accounts";
import { useMutation } from "@tanstack/react-query";

export const usePostAccountMutation = (settings?: MutationSettings<PostAccountConfig, typeof postAccount>) =>
  useMutation({
    mutationKey: ["accounts"],
    mutationFn: ({ params, config }) =>
      postAccount({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
