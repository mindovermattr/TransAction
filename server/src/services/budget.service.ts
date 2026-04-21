import { Prisma, TransactionTag } from "@prisma/client";
import HttpException from "../exceptions/Http.exception";
import { getDateRange } from "../helpers/getDateRange";
import type {
  CreateBudgetDTO,
  UpdateBudgetDTO,
} from "../models/budget/budget.dto";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";

const BUDGET_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const budgetSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  monthStart: true,
  tag: true,
  limit: true,
  isArchived: true,
  userId: true,
} satisfies Prisma.BudgetSelect;

type BudgetRecord = Prisma.BudgetGetPayload<{
  select: typeof budgetSelect;
}>;

type BudgetStatus = "ok" | "warning" | "over";

type BudgetSnapshot = Omit<BudgetRecord, "monthStart"> & {
  month: string;
  spent: number;
  remaining: number;
  progressPercent: number;
  status: BudgetStatus;
};

const formatBudgetMonth = (date: Date) => date.toISOString().slice(0, 7);

const resolveBudgetMonthRange = (month?: string) => {
  if (month !== undefined && !BUDGET_MONTH_REGEX.test(month)) {
    throw new HttpException(400, "Неверный формат месяца", "INVALID_BUDGET_MONTH");
  }

  const now = new Date();
  const [year, rawMonth] = month
    ? month.split("-").map((value) => Number.parseInt(value, 10))
    : [now.getUTCFullYear(), now.getUTCMonth() + 1];

  const { startDate, endDate } = getDateRange(year, rawMonth - 1);

  return {
    month: formatBudgetMonth(startDate),
    monthStart: startDate,
    monthEnd: endDate,
  };
};

const getBudgetStatus = (progressPercent: number): BudgetStatus => {
  if (progressPercent >= 100) {
    return "over";
  }

  if (progressPercent >= 80) {
    return "warning";
  }

  return "ok";
};

const mapBudgetSnapshot = (
  budget: BudgetRecord,
  spent: number,
): BudgetSnapshot => {
  const remaining = budget.limit - spent;
  const progressPercent =
    budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

  return {
    id: budget.id,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
    month: formatBudgetMonth(budget.monthStart),
    tag: budget.tag,
    limit: budget.limit,
    isArchived: budget.isArchived,
    userId: budget.userId,
    spent,
    remaining,
    progressPercent,
    status: getBudgetStatus(progressPercent),
  };
};

const getBudgetSpendByTag = async (
  userId: number,
  tags: TransactionTag[],
  monthStart: Date,
  monthEnd: Date,
) => {
  if (tags.length === 0) {
    return new Map<TransactionTag, number>();
  }

  const groupedSpend = (await prisma.transaction.groupBy({
    by: ["tag"],
    where: {
      userId,
      tag: {
        in: tags,
      },
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    _sum: {
      price: true,
    },
  })) as Array<{
    tag: TransactionTag;
    _sum: {
      price: number | null;
    };
  }>;

  return new Map(
    groupedSpend.map(
      (entry) =>
        [entry.tag, entry._sum.price ?? 0] satisfies [TransactionTag, number],
    ),
  );
};

const getBudgetSnapshots = async (
  userId: number,
  budgets: BudgetRecord[],
  monthStart: Date,
  monthEnd: Date,
) => {
  const spendsByTag = await getBudgetSpendByTag(
    userId,
    [...new Set(budgets.map((budget) => budget.tag))],
    monthStart,
    monthEnd,
  );

  return budgets.map((budget) =>
    mapBudgetSnapshot(budget, spendsByTag.get(budget.tag) ?? 0),
  );
};

const summarizeBudgets = (items: BudgetSnapshot[]) =>
  items.reduce(
    (acc, item) => {
      acc.totalLimit += item.limit;
      acc.totalSpent += item.spent;
      acc.totalRemaining += item.remaining;
      acc.activeCount += 1;

      if (item.status === "over") {
        acc.overCount += 1;
      } else if (item.status === "warning") {
        acc.warningCount += 1;
      }

      return acc;
    },
    {
      totalLimit: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overCount: 0,
      warningCount: 0,
      activeCount: 0,
    },
  );

const ensureActiveBudgetUnique = async (
  userId: number,
  tag: TransactionTag,
  monthStart: Date,
  options: {
    excludeId?: number;
  } = {},
) => {
  const duplicate = await prisma.budget.findFirst({
    where: {
      userId,
      tag,
      monthStart,
      isArchived: false,
      ...(options.excludeId ? { id: { not: options.excludeId } } : {}),
    },
    select: {
      id: true,
    },
  });

  if (duplicate) {
    throw new HttpException(
      409,
      "Бюджет для категории на этот месяц уже существует",
      "BUDGET_ALREADY_EXISTS",
    );
  }
};

const getBudgetRecordOrThrow = async (userId: number, budgetId: number) => {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
    select: budgetSelect,
  });

  if (!budget) {
    throw new HttpException(404, "Бюджет не найден", "BUDGET_NOT_FOUND");
  }

  return budget;
};

const getBudgetDateRangeFromRecord = (
  budget: Pick<BudgetRecord, "monthStart">,
) => getDateRange(budget.monthStart.getUTCFullYear(), budget.monthStart.getUTCMonth());

const getBudgets = async (
  user: Omit<User, "password">,
  options: {
    month?: string;
    includeArchived?: boolean;
  } = {},
) => {
  const { month, monthStart, monthEnd } = resolveBudgetMonthRange(options.month);

  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      monthStart,
      ...(options.includeArchived ? {} : { isArchived: false }),
    },
    select: budgetSelect,
    orderBy: [{ isArchived: "asc" }, { tag: "asc" }],
  });

  const items = await getBudgetSnapshots(user.id, budgets, monthStart, monthEnd);
  const activeItems = items.filter((item) => !item.isArchived);

  return {
    month,
    summary: summarizeBudgets(activeItems),
    items,
  };
};

const createBudget = async (
  user: Omit<User, "password">,
  payload: CreateBudgetDTO,
) => {
  const { monthStart, monthEnd } = resolveBudgetMonthRange(payload.month);
  await ensureActiveBudgetUnique(user.id, payload.tag, monthStart);

  const budget = await prisma.budget.create({
    data: {
      monthStart,
      tag: payload.tag,
      limit: payload.limit,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
    select: budgetSelect,
  });

  const [snapshot] = await getBudgetSnapshots(
    user.id,
    [budget],
    monthStart,
    monthEnd,
  );
  return snapshot;
};

const updateBudget = async (
  user: Omit<User, "password">,
  budgetId: number,
  payload: UpdateBudgetDTO,
) => {
  const currentBudget = await getBudgetRecordOrThrow(user.id, budgetId);

  const currentRange = getBudgetDateRangeFromRecord(currentBudget);
  const nextMonthRange = payload.month
    ? resolveBudgetMonthRange(payload.month)
    : {
        month: formatBudgetMonth(currentBudget.monthStart),
        monthStart: currentBudget.monthStart,
        monthEnd: currentRange.endDate,
      };

  const nextTag = payload.tag ?? currentBudget.tag;

  if (!currentBudget.isArchived) {
    await ensureActiveBudgetUnique(user.id, nextTag, nextMonthRange.monthStart, {
      excludeId: currentBudget.id,
    });
  }

  const updatedBudget = await prisma.budget.update({
    where: {
      id: budgetId,
    },
    data: {
      ...(payload.month ? { monthStart: nextMonthRange.monthStart } : {}),
      ...(payload.tag ? { tag: payload.tag } : {}),
      ...(typeof payload.limit === "number" ? { limit: payload.limit } : {}),
    },
    select: budgetSelect,
  });

  const [snapshot] = await getBudgetSnapshots(
    user.id,
    [updatedBudget],
    nextMonthRange.monthStart,
    nextMonthRange.monthEnd,
  );

  return snapshot;
};

const archiveBudget = async (user: Omit<User, "password">, budgetId: number) => {
  const currentBudget = await getBudgetRecordOrThrow(user.id, budgetId);

  const archivedBudget = await prisma.budget.update({
    where: {
      id: budgetId,
    },
    data: {
      isArchived: true,
    },
    select: budgetSelect,
  });

  const { startDate, endDate } = getBudgetDateRangeFromRecord(currentBudget);
  const [snapshot] = await getBudgetSnapshots(
    user.id,
    [archivedBudget],
    startDate,
    endDate,
  );

  return snapshot;
};

const getBudgetAlerts = async (userId: number) => {
  const { monthStart, monthEnd } = resolveBudgetMonthRange();

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      monthStart,
      isArchived: false,
    },
    select: budgetSelect,
  });

  if (budgets.length === 0) {
    return {
      activeCount: 0,
      overCount: 0,
      warningCount: 0,
      topOverBudgetTag: null,
      topOverBudgetAmount: 0,
    };
  }

  const items = await getBudgetSnapshots(userId, budgets, monthStart, monthEnd);
  const overItems = items
    .filter((item) => item.status === "over")
    .sort((left, right) => Math.abs(right.remaining) - Math.abs(left.remaining));

  return {
    activeCount: items.length,
    overCount: overItems.length,
    warningCount: items.filter((item) => item.status === "warning").length,
    topOverBudgetTag: overItems[0]?.tag ?? null,
    topOverBudgetAmount: overItems[0] ? Math.abs(overItems[0].remaining) : 0,
  };
};

export {
  archiveBudget,
  createBudget,
  getBudgetAlerts,
  getBudgets,
  updateBudget,
};
