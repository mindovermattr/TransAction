import HttpException from "../exceptions/Http.exception";
import type { TransactionDTO } from "../models/transaction/transaction.dto";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";

const getTransactions = async (user: Omit<User, "password">) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      user: {
        id: user.id,
      },
    },
  });

  if (!transactions)
    throw new HttpException(400, "У пользователя нет транзакций");

  return transactions;
};

const createTransaction = async (
  user: User,
  transactionDTO: TransactionDTO,
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

export { getTransactions, createTransaction, getTransactionsSummary };
