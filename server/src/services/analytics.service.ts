import { $Enums } from "@prisma/client";
import type { AnalyticsPeriod } from "../helpers/getAnalyticsDateRange";
import { getAnalyticsDateRange } from "../helpers/getAnalyticsDateRange";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";

type ExpensesByCategoryResponse = {
  period: AnalyticsPeriod;
  range: {
    startDate: Date;
    endDate: Date;
  };
  data: {
    tag: $Enums.TransactionTag;
    total: number;
  }[];
};

type ExpenseTrendResponse = {
  period: AnalyticsPeriod;
  granularity: "day" | "week" | "month";
  points: {
    label: string;
    date: string;
    total: number;
  }[];
};

type BalanceOverviewResponse = {
  period: AnalyticsPeriod;
  range: {
    startDate: Date;
    endDate: Date;
  };
  totals: {
    expenses: number;
    income: number;
    balance: number;
  };
};

type ExpensesByWeekdayResponse = {
  period: AnalyticsPeriod;
  range: {
    startDate: Date;
    endDate: Date;
  };
  data: {
    weekday: number;
    label: string;
    total: number;
  }[];
};

const buildBucketKey = (date: Date, granularity: "day" | "week" | "month") => {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");

  if (granularity === "day") {
    return `${year}-${month}-${day}`;
  }

  if (granularity === "week") {
    const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000);
    const week = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7
    );
    return `${year}-W${week.toString().padStart(2, "0")}`;
  }

  return `${year}-${month}`;
};

const buildBucketLabel = (
  key: string,
  granularity: "day" | "week" | "month"
) => {
  if (granularity === "week") {
    const [year, week] = key.split("-W");
    return `Неделя ${week}, ${year}`;
  }

  if (granularity === "month") {
    const [year, month] = key.split("-");
    return `${month}.${year}`;
  }

  return key;
};

const getExpensesByCategory = async (
  user: Omit<User, "password">,
  period: AnalyticsPeriod
): Promise<ExpensesByCategoryResponse> => {
  const { startDate, endDate } = getAnalyticsDateRange(period);

  type GrouppedTransactions = {
    tag: $Enums.TransactionTag;
    _sum: {
      price: number | null;
    };
  }[];

  const grouped = (await prisma.transaction.groupBy({
    by: ["tag"],
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      price: true,
    },
  })) as GrouppedTransactions;

  return {
    period,
    range: { startDate, endDate },
    data: grouped.map((item) => ({
      tag: item.tag,
      total: item._sum.price ?? 0,
    })),
  };
};

const getExpensesTrend = async (
  user: Omit<User, "password">,
  period: AnalyticsPeriod
): Promise<ExpenseTrendResponse> => {
  const { startDate, endDate, granularity } = getAnalyticsDateRange(period);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      price: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const bucketMap = new Map<
    string,
    {
      total: number;
      date: Date;
    }
  >();

  transactions.forEach((transaction) => {
    const bucketKey = buildBucketKey(transaction.date, granularity);
    const entry = bucketMap.get(bucketKey);

    if (!entry) {
      bucketMap.set(bucketKey, {
        total: transaction.price,
        date: transaction.date,
      });
      return;
    }

    entry.total += transaction.price;
  });

  const points = Array.from(bucketMap.entries()).map(([key, value]) => ({
    label: buildBucketLabel(key, granularity),
    date: value.date.toISOString(),
    total: value.total,
  }));

  return {
    period,
    granularity,
    points,
  };
};

const getBalanceOverview = async (
  user: Omit<User, "password">,
  period: AnalyticsPeriod
): Promise<BalanceOverviewResponse> => {
  const { startDate, endDate } = getAnalyticsDateRange(period);

  const [expenses, income] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),
    prisma.income.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),
  ]);

  const totalExpenses = expenses._sum.price ?? 0;
  const totalIncome = income._sum.price ?? 0;

  return {
    period,
    range: { startDate, endDate },
    totals: {
      expenses: totalExpenses,
      income: totalIncome,
      balance: totalIncome - totalExpenses,
    },
  };
};

const WEEKDAY_LABELS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

const getWeekdayIndex = (date: Date) => {
  const utcDay = date.getUTCDay(); 
  return (utcDay + 6) % 7; 
};

const getExpensesByWeekday = async (
  user: Omit<User, "password">,
  period: AnalyticsPeriod
): Promise<ExpensesByWeekdayResponse> => {
  const { startDate, endDate } = getAnalyticsDateRange(period);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      price: true,
    },
  });

  const totals = Array.from({ length: 7 }, () => 0);

  transactions.forEach((transaction) => {
    const index = getWeekdayIndex(transaction.date);
    totals[index] += transaction.price;
  });

  return {
    period,
    range: { startDate, endDate },
    data: totals.map((total, index) => ({
      weekday: index,
      label: WEEKDAY_LABELS[index],
      total,
    })),
  };
};

export {
  getBalanceOverview,
  getExpensesByCategory,
  getExpensesByWeekday,
  getExpensesTrend,
};
export type {
  BalanceOverviewResponse,
  ExpensesByCategoryResponse,
  ExpensesByWeekdayResponse,
  ExpenseTrendResponse,
};
