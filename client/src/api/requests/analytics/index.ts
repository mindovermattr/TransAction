import { protectedInstance } from "@/api/instance";

export type AnalyticsRequestBody = {
  period: AnalyticsPeriod;
};

export type AnalyticsRequestConfig = OfetchRequestConfig<AnalyticsRequestBody>;
type AnalyticsPeriodMetadata = {
  period: AnalyticsPeriod;
  range: {
    startDate: string;
    endDate: string;
  };
};

export type ExpensesByCategoryResponse = AnalyticsPeriodMetadata & {
  data: {
    tag: TransactionTags;
    total: number;
  }[];
};

export const getExpensesByCategoryAnalytics = ({
  params,
  config,
}: AnalyticsRequestConfig) =>
  protectedInstance<ExpensesByCategoryResponse>(
    "analytics/expenses/by-category",
    {
      method: "POST",
      body: params,
      ...config,
    },
  );

export type ExpenseTrendResponse = {
  period: AnalyticsPeriod;
  granularity: "day" | "week" | "month";
  points: {
    label: string;
    date: string;
    total: number;
  }[];
};

export const getExpensesTrendAnalytics = ({
  params,
  config,
}: AnalyticsRequestConfig) =>
  protectedInstance<ExpenseTrendResponse>("analytics/expenses/trend", {
    method: "POST",
    body: params,
    ...config,
  });

export type BalanceOverviewResponse = AnalyticsPeriodMetadata & {
  totals: {
    expenses: number;
    income: number;
    balance: number;
  };
};

export const getBalanceOverviewAnalytics = ({
  params,
  config,
}: AnalyticsRequestConfig) =>
  protectedInstance<BalanceOverviewResponse>("analytics/balance/overview", {
    method: "POST",
    body: params,
    ...config,
  });

export type ExpensesByWeekdayResponse = AnalyticsPeriodMetadata & {
  data: {
    weekday: number;
    label: string;
    total: number;
  }[];
};

export const getExpensesByWeekdayAnalytics = ({
  params,
  config,
}: AnalyticsRequestConfig) =>
  protectedInstance<ExpensesByWeekdayResponse>(
    "analytics/expenses/by-weekday",
    {
      method: "POST",
      body: params,
      ...config,
    },
  );
