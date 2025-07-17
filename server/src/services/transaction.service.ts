import HttpException from "../exceptions/Http.exception";
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

export { getTransactions };
