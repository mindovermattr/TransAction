import { $Enums } from "@prisma/client";
import { getDateRange } from "../helpers/getDateRange";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";
import { getBudgetAlerts } from "./budget.service";

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
  const day = date.getUTCDay();
  return day === 0 ? 6 : day - 1;
};

const calculateDeltaPercent = (current: number, previous: number) => {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
};

const getDashboardOverview = async (user: Omit<User, "password">) => {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  const currentMonthRange = getDateRange(currentYear, currentMonth);
  const previousMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
  const previousMonthRange = getDateRange(
    previousMonthDate.getUTCFullYear(),
    previousMonthDate.getUTCMonth(),
  );

  type GroupedCategory = {
    tag: $Enums.TransactionTag;
    _sum: {
      price: number | null;
    };
  };

  const [
    currentExpenses,
    currentIncome,
    previousExpenses,
    previousIncome,
    groupedCategories,
    currentMonthTransactions,
    recentTransactions,
    recentIncome,
    budgetAlerts,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: currentMonthRange.startDate,
          lte: currentMonthRange.endDate,
        },
      },
      _sum: { price: true },
    }),
    prisma.income.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: currentMonthRange.startDate,
          lte: currentMonthRange.endDate,
        },
      },
      _sum: { price: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: previousMonthRange.startDate,
          lte: previousMonthRange.endDate,
        },
      },
      _sum: { price: true },
    }),
    prisma.income.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: previousMonthRange.startDate,
          lte: previousMonthRange.endDate,
        },
      },
      _sum: { price: true },
    }),
    prisma.transaction.groupBy({
      by: ["tag"],
      where: {
        userId: user.id,
        date: {
          gte: currentMonthRange.startDate,
          lte: currentMonthRange.endDate,
        },
      },
      _sum: {
        price: true,
      },
      orderBy: {
        _sum: {
          price: "desc",
        },
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: currentMonthRange.startDate,
          lte: currentMonthRange.endDate,
        },
      },
      select: {
        date: true,
        price: true,
      },
      orderBy: {
        date: "desc",
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      take: 5,
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        name: true,
        price: true,
        date: true,
        tag: true,
      },
    }),
    prisma.income.findMany({
      where: {
        userId: user.id,
      },
      take: 5,
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        name: true,
        price: true,
        date: true,
      },
    }),
    getBudgetAlerts(user.id),
  ]);

  const incomeTotal = currentIncome._sum.price ?? 0;
  const expensesTotal = currentExpenses._sum.price ?? 0;
  const balance = incomeTotal - expensesTotal;
  const savingsRate =
    incomeTotal > 0 ? Math.max(0, Math.round((balance / incomeTotal) * 100)) : 0;

  const previousIncomeTotal = previousIncome._sum.price ?? 0;
  const previousExpensesTotal = previousExpenses._sum.price ?? 0;

  const topCategories = (groupedCategories as GroupedCategory[]).map((item) => {
    const total = item._sum.price ?? 0;
    return {
      tag: item.tag,
      total,
      sharePercent:
        expensesTotal > 0 ? Math.round((total / expensesTotal) * 100) : 0,
    };
  });

  const topCategory = topCategories[0] ?? null;

  const dailyTotals = new Map<string, number>();
  const weekdayTotals = Array.from({ length: 7 }, (_, index) => ({
    weekday: index,
    label: WEEKDAY_LABELS[index],
    total: 0,
  }));

  currentMonthTransactions.forEach((transaction) => {
    const dayKey = transaction.date.toISOString().slice(0, 10);
    dailyTotals.set(dayKey, (dailyTotals.get(dayKey) ?? 0) + transaction.price);

    const weekdayIndex = getWeekdayIndex(transaction.date);
    weekdayTotals[weekdayIndex].total += transaction.price;
  });

  let peakSpendDay: { date: string; total: number } | null = null;

  dailyTotals.forEach((total, date) => {
    if (!peakSpendDay || total > peakSpendDay.total) {
      peakSpendDay = {
        date,
        total,
      };
    }
  });

  const cashflowMonths = await Promise.all(
    Array.from({ length: 6 }, async (_, index) => {
      const monthDate = new Date(Date.UTC(currentYear, currentMonth - (5 - index), 1));
      const range = getDateRange(monthDate.getUTCFullYear(), monthDate.getUTCMonth());

      const [monthExpenses, monthIncome] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId: user.id,
            date: {
              gte: range.startDate,
              lte: range.endDate,
            },
          },
          _sum: { price: true },
        }),
        prisma.income.aggregate({
          where: {
            userId: user.id,
            date: {
              gte: range.startDate,
              lte: range.endDate,
            },
          },
          _sum: { price: true },
        }),
      ]);

      const monthIncomeTotal = monthIncome._sum.price ?? 0;
      const monthExpensesTotal = monthExpenses._sum.price ?? 0;

      return {
        monthStart: range.startDate.toISOString(),
        income: monthIncomeTotal,
        expenses: monthExpensesTotal,
        balance: monthIncomeTotal - monthExpensesTotal,
      };
    }),
  );

  const recentActivity = [...recentTransactions, ...recentIncome]
    .map((item) => {
      if ("tag" in item) {
        return {
          id: `expense-${item.id}`,
          type: "expense" as const,
          name: item.name,
          amount: item.price,
          date: item.date.toISOString(),
          tag: item.tag,
        };
      }

      return {
        id: `income-${item.id}`,
        type: "income" as const,
        name: item.name,
        amount: item.price,
        date: item.date.toISOString(),
      };
    })
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 5);

  return {
    period: "month" as const,
    totals: {
      income: incomeTotal,
      expenses: expensesTotal,
      balance,
      savingsRate,
    },
    comparisons: {
      previousIncome: previousIncomeTotal,
      previousExpenses: previousExpensesTotal,
      incomeDeltaPercent: calculateDeltaPercent(incomeTotal, previousIncomeTotal),
      expensesDeltaPercent: calculateDeltaPercent(expensesTotal, previousExpensesTotal),
    },
    budgetAlerts,
    insights: {
      topCategory: topCategory
        ? {
            tag: topCategory.tag as $Enums.TransactionTag,
            total: topCategory.total,
            sharePercent: topCategory.sharePercent,
          }
        : null,
      peakSpendDay,
    },
    cashflow: {
      months: cashflowMonths,
    },
    topCategories,
    weekdayTotals,
    recentActivity,
  };
};

export { getDashboardOverview };
