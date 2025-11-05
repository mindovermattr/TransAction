import HttpException from "../exceptions/Http.exception";
import { getDateRange } from "../helpers/getDateRange";
import { IncomeDTO } from "../models/income/income.dto";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";

const getIncomes = async (user: Omit<User, "password">) => {
  const incomes = await prisma.income.findMany({
    where: {
      user: {
        id: user.id,
      },
    },
  });
  if (!incomes.length)
    throw new HttpException(400, "У пользователя нет доходов");

  return incomes;
};

const getIncomeSummary = async (user: Omit<User, "password">) => {
  const date = new Date();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  const currentMonth = getDateRange(year, month);
  const prevMonth = getDateRange(
    month - 1 < 0 ? year - 1 : year,
    month - 1 < 0 ? 11 : month - 1
  );

  const [currentMonthIncomes, prevMonthIncomes] = await Promise.all([
    prisma.income.aggregate({
      where: {
        user: {
          id: user.id,
        },
        date: {
          gte: currentMonth.startDate,
          lte: currentMonth.endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),
    prisma.income.aggregate({
      where: {
        user: {
          id: user.id,
        },
        date: {
          gte: prevMonth.startDate,
          lte: prevMonth.endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),
  ]);

  return {
    currentMonthSum: currentMonthIncomes._sum.price ?? 0,
    prevMonthSum: prevMonthIncomes._sum.price ?? 0,
  };
};

const createIncome = async (user: User, incomeDTO: IncomeDTO) => {
  const createdIncome = await prisma.income.create({
    data: {
      ...incomeDTO,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  if (!createdIncome) throw new HttpException(400, "Не удалось создать доход");

  return createdIncome;
};

export { createIncome, getIncomes, getIncomeSummary };
