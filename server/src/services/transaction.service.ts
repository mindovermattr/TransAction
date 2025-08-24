import HttpException from "../exceptions/Http.exception";
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
        id: user.id,
      },
    }),
  ]);

  if (!transactions.length)
    throw new HttpException(400, "У пользователя нет транзакций");

  const totalPages = Math.ceil(transactionCount / limit);

  return {
    data: transactions,
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
  date.setDate(date.getDate() - 60);

  const transactions = await prisma.transaction.findMany({
    where: {
      user: {
        id: user.id,
      },
      date: {
        gte: date,
      },
    },
  });

  if (!transactions)
    throw new HttpException(400, "У пользователя нет транзакций");

  return transactions;
};

export { createTransaction, getTransactions, getTransactionsSummary };
