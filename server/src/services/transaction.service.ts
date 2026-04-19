import { Prisma, TransactionTag } from "@prisma/client";
import HttpException from "../exceptions/Http.exception";
import { getDateRange } from "../helpers/getDateRange";
import type {
  TransactionDTO,
  UpdateTransactionDTO,
} from "../models/transaction/transaction.dto";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";

type SortOrder = "asc" | "desc";
type TransactionSortBy = "date" | "price" | "name" | "createdAt";

type TransactionListFilters = {
  search?: string;
  tag?: TransactionTag;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: TransactionSortBy;
  sortOrder?: SortOrder;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const getTransactions = async (
  user: Omit<User, "password">,
  filters: TransactionListFilters = {}
) => {
  const page =
    !filters.page || Number.isNaN(filters.page) || filters.page < 1
      ? DEFAULT_PAGE
      : filters.page;

  const limit =
    !filters.limit || Number.isNaN(filters.limit) || filters.limit < 1
      ? DEFAULT_LIMIT
      : Math.min(filters.limit, MAX_LIMIT);

  const sortBy: TransactionSortBy = filters.sortBy ?? "date";
  const sortOrder: SortOrder = filters.sortOrder ?? "desc";

  const where: Prisma.TransactionWhereInput = {
    userId: user.id,
  };

  if (filters.search) {
    where.name = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  if (filters.tag) {
    where.tag = filters.tag;
  }

  const priceFilters: Prisma.IntFilter = {};
  if (typeof filters.minAmount === "number") {
    priceFilters.gte = filters.minAmount;
  }
  if (typeof filters.maxAmount === "number") {
    priceFilters.lte = filters.maxAmount;
  }
  if (Object.keys(priceFilters).length > 0) {
    where.price = priceFilters;
  }

  const dateFilters: Prisma.DateTimeFilter = {};
  if (filters.dateFrom) {
    dateFilters.gte = filters.dateFrom;
  }
  if (filters.dateTo) {
    dateFilters.lte = filters.dateTo;
  }
  if (Object.keys(dateFilters).length > 0) {
    where.date = dateFilters;
  }

  const [items, totalItems] = await Promise.all([
    prisma.transaction.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages =
    totalItems === 0 ? 1 : Math.ceil(totalItems / limit);

  return {
    items,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

const createTransaction = async (
  user: User,
  transactionDTO: TransactionDTO
) => {
  return prisma.transaction.create({
    data: {
      ...transactionDTO,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
};

const updateTransaction = async (
  user: Omit<User, "password">,
  transactionId: number,
  payload: UpdateTransactionDTO
) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId: user.id,
    },
  });

  if (!transaction) {
    throw new HttpException(404, "Транзакция не найдена", "TRANSACTION_NOT_FOUND");
  }

  return prisma.transaction.update({
    where: {
      id: transactionId,
    },
    data: payload,
  });
};

const deleteTransaction = async (
  user: Omit<User, "password">,
  transactionId: number
) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!transaction) {
    throw new HttpException(404, "Транзакция не найдена", "TRANSACTION_NOT_FOUND");
  }

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  return {
    success: true,
  };
};

const getTransactionsSummary = async (user: Omit<User, "password">) => {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  const currentMonth = getDateRange(year, month);
  const previousMonthDate = new Date(Date.UTC(year, month - 1, 1));
  const prevMonth = getDateRange(
    previousMonthDate.getUTCFullYear(),
    previousMonthDate.getUTCMonth()
  );

  const [currentMonthTransactions, prevMonthTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: currentMonth.startDate,
          lte: currentMonth.endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
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
    currentMonthSum: currentMonthTransactions._sum.price ?? 0,
    prevMonthSum: prevMonthTransactions._sum.price ?? 0,
  };
};

export {
  createTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionsSummary,
  updateTransaction,
};
export type { TransactionListFilters };
