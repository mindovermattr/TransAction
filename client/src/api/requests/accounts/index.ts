import { protectedInstance } from "@/api/instance";

export type AccountResponse = Omit<
  AccountBalanceSnapshot,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export type TransferResponse = Omit<
  Transfer,
  "createdAt" | "updatedAt" | "date"
> & {
  createdAt: string;
  updatedAt: string;
  date: string;
};

export type GetAccountsParams = {
  includeArchived?: boolean;
};

export type GetAccountsConfig = OfetchRequestConfig<
  GetAccountsParams,
  "json",
  true
>;

export const getAccounts = (requestConfig?: GetAccountsConfig) =>
  protectedInstance<AccountResponse[]>("accounts", {
    query: requestConfig?.params,
    ...requestConfig?.config,
  });

export type PostAccountParams = Pick<
  Account,
  "name" | "type" | "currency" | "openingBalance"
>;

export type PostAccountConfig = OfetchRequestConfig<PostAccountParams>;

export const postAccount = ({ params, config }: PostAccountConfig) =>
  protectedInstance<AccountResponse>("accounts", {
    method: "POST",
    body: params,
    ...config,
  });

export type PatchAccountParams = Partial<PostAccountParams>;
export type PatchAccountConfig = OfetchRequestConfig<{
  id: number;
  data: PatchAccountParams;
}>;

export const patchAccount = ({ params, config }: PatchAccountConfig) =>
  protectedInstance<AccountResponse>(`accounts/${params.id}`, {
    method: "PATCH",
    body: params.data,
    ...config,
  });

export type DeleteAccountConfig = OfetchRequestConfig<{ id: number }>;

export const deleteAccount = ({ params, config }: DeleteAccountConfig) =>
  protectedInstance<AccountResponse>(`accounts/${params.id}`, {
    method: "DELETE",
    ...config,
  });

export type PostTransferParams = Omit<
  Transfer,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "userId"
  | "fromAccount"
  | "toAccount"
  | "date"
> & {
  date: string;
};

export type PostTransferConfig = OfetchRequestConfig<PostTransferParams>;

export const postTransfer = ({ params, config }: PostTransferConfig) =>
  protectedInstance<TransferResponse>("transfers", {
    method: "POST",
    body: params,
    ...config,
  });
