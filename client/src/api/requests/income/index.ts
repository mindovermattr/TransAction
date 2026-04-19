import { protectedInstance } from "@/api/instance";

export type IncomeResponse = Omit<Income, "date"> & {
  date: string;
};

type SortOrder = "asc" | "desc";
type IncomeSortBy = "date" | "price" | "name" | "createdAt";

export type IncomeListParams = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: IncomeSortBy;
  sortOrder?: SortOrder;
};

export type PaginatedIncomeResponse = {
  items: IncomeResponse[];
  pagination: PaginationMeta;
};

export type GetIncomeConfig = OfetchRequestConfig<
  IncomeListParams,
  "json",
  true
>;

export const getIncome = (requestConfig?: GetIncomeConfig) =>
  protectedInstance<PaginatedIncomeResponse>("income", {
    query: requestConfig?.params,
    ...requestConfig?.config,
  });

export type IncomeSummaryResponse = {
  currentMonthSum: number;
  prevMonthSum: number;
};

export type GetIncomeSummaryConfig = OfetchRequestConfig;

export const getIncomeSummary = (requestConfig?: GetIncomeSummaryConfig) =>
  protectedInstance<IncomeSummaryResponse>(
    "income/summary",
    requestConfig?.config
  );

export type PostIncomeParams = Omit<
  Income,
  "userId" | "createdAt" | "updatedAt" | "id" | "date"
> & {
  date: string;
};

export type PostIncomeConfig = OfetchRequestConfig<PostIncomeParams>;

export const postIncome = ({ params, config }: PostIncomeConfig) =>
  protectedInstance<IncomeResponse>("income", {
    method: "POST",
    body: params,
    ...config,
  });

export type PatchIncomeParams = Partial<PostIncomeParams>;
export type PatchIncomeConfig = OfetchRequestConfig<{
  id: number;
  data: PatchIncomeParams;
}>;

export const patchIncome = ({ params, config }: PatchIncomeConfig) =>
  protectedInstance<IncomeResponse>(`income/${params.id}`, {
    method: "PATCH",
    body: params.data,
    ...config,
  });

export type DeleteIncomeConfig = OfetchRequestConfig<{ id: number }>;

export const deleteIncome = ({ params, config }: DeleteIncomeConfig) =>
  protectedInstance<{ success: boolean }>(`income/${params.id}`, {
    method: "DELETE",
    ...config,
  });
