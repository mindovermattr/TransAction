import { protectedInstance } from "@/api/instance";

export type GetDashboardOverviewConfig = OfetchRequestConfig;

export const getDashboardOverview = (requestConfig?: GetDashboardOverviewConfig) =>
  protectedInstance<DashboardOverviewResponse>("dashboard/overview", requestConfig?.config);
