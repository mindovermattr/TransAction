import { Prisma } from "@prisma/client";
import HttpException from "../exceptions/Http.exception";
import { getDateRange } from "../helpers/getDateRange";
import type { IncomeDTO, UpdateIncomeDTO } from "../models/income/income.dto";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";

type SortOrder = "asc" | "desc";
type IncomeSortBy = "date" | "price" | "name" | "createdAt";

type IncomeListFilters = {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: IncomeSortBy;
  sortOrder?: SortOrder;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const getIncomes = async (
  user: Omit<User, "password">,
  filters: IncomeListFilters = {}
) => {
  const page =
    !filters.page || Number.isNaN(filters.page) || filters.page < 1
      ? DEFAULT_PAGE
      : filters.page;

  const limit =
    !filters.limit || Number.isNaN(filters.limit) || filters.limit < 1
      ? DEFAULT_LIMIT
      : Math.min(filters.limit, MAX_LIMIT);

  const sortBy: IncomeSortBy = filters.sortBy ?? "date";
  const sortOrder: SortOrder = filters.sortOrder ?? "desc";

  const where: Prisma.IncomeWhereInput = {
    userId: user.id,
  };

  if (filters.search) {
    where.name = {
      contains: filters.search,
      mode: "insensitive",
    };
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
    prisma.income.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.income.count({
      where,
    }),
  ]);

  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);

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

const getIncomeSummary = async (user: Omit<User, "password">) => {
  const date = new Date();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  const currentMonth = getDateRange(year, month);
  const previousMonthDate = new Date(Date.UTC(year, month - 1, 1));
  const prevMonth = getDateRange(
    previousMonthDate.getUTCFullYear(),
    previousMonthDate.getUTCMonth()
  );

  const [currentMonthIncomes, prevMonthIncomes] = await Promise.all([
    prisma.income.aggregate({
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
    prisma.income.aggregate({
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
    currentMonthSum: currentMonthIncomes._sum.price ?? 0,
    prevMonthSum: prevMonthIncomes._sum.price ?? 0,
  };
};

const createIncome = async (user: User, incomeDTO: IncomeDTO) => {
  return prisma.income.create({
    data: {
      ...incomeDTO,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
};

const updateIncome = async (
  user: Omit<User, "password">,
  incomeId: number,
  payload: UpdateIncomeDTO
) => {
  const income = await prisma.income.findFirst({
    where: {
      id: incomeId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!income) {
    throw new HttpException(404, "Доход не найден", "INCOME_NOT_FOUND");
  }

  return prisma.income.update({
    where: {
      id: incomeId,
    },
    data: payload,
  });
};

const deleteIncome = async (user: Omit<User, "password">, incomeId: number) => {
  const income = await prisma.income.findFirst({
    where: {
      id: incomeId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!income) {
    throw new HttpException(404, "Доход не найден", "INCOME_NOT_FOUND");
  }

  await prisma.income.delete({
    where: {
      id: incomeId,
    },
  });

  return {
    success: true,
  };
};

export {
  createIncome,
  deleteIncome,
  getIncomeSummary,
  getIncomes,
  updateIncome,
};
export type { IncomeListFilters };
