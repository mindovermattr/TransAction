import { protectedInstance } from "@/api/instance";

export type BudgetResponse = Omit<Budget, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type GetBudgetsParams = {
  month?: string;
  includeArchived?: boolean;
};

export type GetBudgetsResponse = Omit<BudgetsResponse, "items"> & {
  items: BudgetResponse[];
};

export type GetBudgetsConfig = OfetchRequestConfig<GetBudgetsParams, "json", true>;

export const getBudgets = (requestConfig?: GetBudgetsConfig) =>
  protectedInstance<GetBudgetsResponse>("budgets", {
    query: requestConfig?.params,
    ...requestConfig?.config,
  });

export type PostBudgetParams = Pick<Budget, "month" | "tag" | "limit">;

export type PostBudgetConfig = OfetchRequestConfig<PostBudgetParams>;

export const postBudget = ({ params, config }: PostBudgetConfig) =>
  protectedInstance<BudgetResponse>("budgets", {
    method: "POST",
    body: params,
    ...config,
  });

export type PatchBudgetParams = Partial<PostBudgetParams>;

export type PatchBudgetConfig = OfetchRequestConfig<{
  id: number;
  data: PatchBudgetParams;
}>;

export const patchBudget = ({ params, config }: PatchBudgetConfig) =>
  protectedInstance<BudgetResponse>(`budgets/${params.id}`, {
    method: "PATCH",
    body: params.data,
    ...config,
  });

export type DeleteBudgetConfig = OfetchRequestConfig<{ id: number }>;

export const deleteBudget = ({ params, config }: DeleteBudgetConfig) =>
  protectedInstance<BudgetResponse>(`budgets/${params.id}`, {
    method: "DELETE",
    ...config,
  });
