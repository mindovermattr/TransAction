import { protectedInstance } from "@/api/instance";

export type IncomeResponse = Omit<Income, "date"> & {
  date: string;
};

export type IncomeSummaryResponse = {
  currentMonthSum: number;
  prevMonthSum: number;
};

export type GetIncomeConfig = OfetchRequestConfig;

export const getIncome = (requestConfig?: GetIncomeConfig) =>
  protectedInstance<IncomeResponse>("income", requestConfig?.config);

export type GetIncomeSummaryConfig = OfetchRequestConfig;

export const getIncomeSummary = (requestConfig?: GetIncomeSummaryConfig) =>
  protectedInstance<IncomeSummaryResponse>(
    "income/summary",
    requestConfig?.config,
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
