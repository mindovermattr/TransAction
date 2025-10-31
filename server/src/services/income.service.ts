import HttpException from "../exceptions/Http.exception";
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

export { createIncome, getIncomes };
