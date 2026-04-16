type AnalyticsPeriod = "month" | "quarter" | "halfYear" | "year";

const buildDate = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

const getAnalyticsDateRange = (period: AnalyticsPeriod) => {
  const currentDate = new Date();
  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth();
  const endDate = buildDate(year, month + 1, 0);

  switch (period) {
    case "quarter": {
      return {
        startDate: new Date(Date.UTC(year, month - 2, 1)),
        endDate,
        granularity: "week" as const,
      };
    }
    case "halfYear": {
      return {
        startDate: new Date(Date.UTC(year, month - 5, 1)),
        endDate,
        granularity: "month" as const,
      };
    }
    case "year": {
      return {
        startDate: new Date(Date.UTC(year, month - 11, 1)),
        endDate,
        granularity: "month" as const,
      };
    }
    case "month":
    default: {
      return {
        startDate: new Date(Date.UTC(year, month, 1)),
        endDate,
        granularity: "day" as const,
      };
    }
  }
};

export { getAnalyticsDateRange };
export type { AnalyticsPeriod };
