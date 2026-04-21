import { patchAccount, type PatchAccountConfig } from "@/api/requests/accounts";
import { useMutation } from "@tanstack/react-query";

export const usePatchAccountMutation = (settings?: MutationSettings<PatchAccountConfig, typeof patchAccount>) =>
  useMutation({
    mutationKey: ["accounts"],
    mutationFn: ({ params, config }) =>
      patchAccount({
        params,
        config: {
          ...settings?.config,
          ...config,
        },
      }),
    ...settings?.options,
  });
