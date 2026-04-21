import { postTransfer, type PostTransferConfig } from "@/api/requests/accounts";
import { useMutation } from "@tanstack/react-query";

export const usePostTransferMutation = (settings?: MutationSettings<PostTransferConfig, typeof postTransfer>) =>
  useMutation({
    mutationKey: ["transfers"],
    mutationFn: ({ params, config }) =>
      postTransfer({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
