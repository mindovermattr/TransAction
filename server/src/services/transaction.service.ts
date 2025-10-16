import HttpException from "../exceptions/Http.exception";
import { getMonthRange } from "../helpers/getDateRange";
import type { TransactionDTO } from "../models/transaction/transaction.dto";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";

type PaginationOptions = {
  page: number;
  limit: number;
};

//TODO: Refactor condition
const getTransactions = async (
  user: Omit<User, "password">,
  paginationOptions: PaginationOptions | false = false
) => {
  if (!paginationOptions) {
    const transactions = await prisma.transaction.findMany({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    if (!transactions.length)
      throw new HttpException(400, "У пользователя нет транзакций");

    return transactions;
  }

  const { limit, page } = paginationOptions;

  if (limit <= 0 || page <= 0)
    throw new HttpException(400, "Неверно указаны query параметры");

  const [transactions, transactionCount] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        user: {
          id: user.id,
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.transaction.count({
      where: {
        userId: user.id,
      },
    }),
  ]);

  if (!transactions.length)
    throw new HttpException(400, "У пользователя нет транзакций");

  const totalPages = Math.ceil(transactionCount / limit);

  return {
    transactions: transactions,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems: transactionCount,
      totalPages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

const createTransaction = async (
  user: User,
  transactionDTO: TransactionDTO
) => {
  const createdTranscation = await prisma.transaction.create({
    data: {
      ...transactionDTO,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  if (!createdTranscation)
    throw new HttpException(400, "Не удалось создать транзакцию");

  return createdTranscation;
};

const getTransactionsSummary = async (user: Omit<User, "password">) => {
  const date = new Date();

  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  const currentMonth = getMonthRange(year, month);
  const prevMonth = getMonthRange(year, month - 1 < 0 ? 12 : month - 1);

  const [currentMonthTransactions, prevMonthTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        user: {
          id: user.id,
        },
        date: {
          gt: currentMonth.startDate,
          lt: currentMonth.endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        user: {
          id: user.id,
        },
        date: {
          gt: prevMonth.startDate,
          lt: prevMonth.endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),
  ]);

  if (!currentMonthTransactions)
    throw new HttpException(400, "У пользователя нет транзакций");

  // TODO: Обработать случай, когда у пользователя
  // 1) Нет транзакций вообще
  // 2) Нет транзакций за предыдущий месяц
  return {
    currentMonthSum: currentMonthTransactions._sum.price ?? 0,
    prevMonthSum: prevMonthTransactions._sum.price ?? 0,
  };
};

export { createTransaction, getTransactions, getTransactionsSummary };
