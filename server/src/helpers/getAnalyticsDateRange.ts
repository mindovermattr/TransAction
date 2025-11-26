type AnalyticsPeriod = "month" | "quarter" | "year";

const buildDate = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

const getAnalyticsDateRange = (period: AnalyticsPeriod) => {
  const currentDate = new Date();
  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth();

  switch (period) {
    case "quarter": {
      const quarterStartMonth = Math.floor(month / 3) * 3;
      const quarterEndMonth = quarterStartMonth + 2;

      return {
        startDate: new Date(Date.UTC(year, quarterStartMonth, 1)),
        endDate: buildDate(year, quarterEndMonth + 1, 0),
        granularity: "week" as const,
      };
    }
    case "year": {
      return {
        startDate: new Date(Date.UTC(year, 0, 1)),
        endDate: buildDate(year + 1, 0, 0),
        granularity: "month" as const,
      };
    }
    case "month":
    default: {
      return {
        startDate: new Date(Date.UTC(year, month, 1)),
        endDate: buildDate(year, month + 1, 0),
        granularity: "day" as const,
      };
    }
  }
};

export { getAnalyticsDateRange };
export type { AnalyticsPeriod };
