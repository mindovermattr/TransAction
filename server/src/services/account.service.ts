import type { Account, Prisma } from "@prisma/client";
import HttpException from "../exceptions/Http.exception";
import type {
  CreateAccountDTO,
  UpdateAccountDTO,
} from "../models/account/account.dto";
import type { User } from "../models/user/user.entity";
import { prisma } from "../prisma";

const accountSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  type: true,
  currency: true,
  openingBalance: true,
  isArchived: true,
  userId: true,
} satisfies Prisma.AccountSelect;

type AccountRecord = Prisma.AccountGetPayload<{
  select: typeof accountSelect;
}>;

const formatAccountSnapshot = (
  account: AccountRecord,
  totals: {
    incomeTotal: number;
    expenseTotal: number;
    transferInTotal: number;
    transferOutTotal: number;
  },
) => ({
  ...account,
  ...totals,
  currentBalance:
    account.openingBalance +
    totals.incomeTotal -
    totals.expenseTotal +
    totals.transferInTotal -
    totals.transferOutTotal,
});

const getAccountTotals = async (userId: number, accountIds: number[]) => {
  if (accountIds.length === 0) {
    return new Map<
      number,
      {
        incomeTotal: number;
        expenseTotal: number;
        transferInTotal: number;
        transferOutTotal: number;
      }
    >();
  }

  const [
    incomeGroups,
    transactionGroups,
    incomingTransfers,
    outgoingTransfers,
  ] = (await Promise.all([
    prisma.income.groupBy({
      by: ["accountId"],
      where: {
        userId,
        accountId: {
          in: accountIds,
        },
      },
      _sum: {
        price: true,
      },
    }),
    prisma.transaction.groupBy({
      by: ["accountId"],
      where: {
        userId,
        accountId: {
          in: accountIds,
        },
      },
      _sum: {
        price: true,
      },
    }),
    prisma.transfer.groupBy({
      by: ["toAccountId"],
      where: {
        userId,
        toAccountId: {
          in: accountIds,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transfer.groupBy({
      by: ["fromAccountId"],
      where: {
        userId,
        fromAccountId: {
          in: accountIds,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ])) as [
    Array<{ accountId: number; _sum: { price: number | null } }>,
    Array<{ accountId: number; _sum: { price: number | null } }>,
    Array<{ toAccountId: number; _sum: { amount: number | null } }>,
    Array<{ fromAccountId: number; _sum: { amount: number | null } }>,
  ];

  const totalsByAccount = new Map<
    number,
    {
      incomeTotal: number;
      expenseTotal: number;
      transferInTotal: number;
      transferOutTotal: number;
    }
  >();

  const ensureTotals = (accountId: number) => {
    const existing = totalsByAccount.get(accountId);
    if (existing) {
      return existing;
    }

    const initial = {
      incomeTotal: 0,
      expenseTotal: 0,
      transferInTotal: 0,
      transferOutTotal: 0,
    };
    totalsByAccount.set(accountId, initial);
    return initial;
  };

  incomeGroups.forEach((group) => {
    ensureTotals(group.accountId).incomeTotal = group._sum.price ?? 0;
  });

  transactionGroups.forEach((group) => {
    ensureTotals(group.accountId).expenseTotal = group._sum.price ?? 0;
  });

  incomingTransfers.forEach((group) => {
    ensureTotals(group.toAccountId).transferInTotal = group._sum.amount ?? 0;
  });

  outgoingTransfers.forEach((group) => {
    ensureTotals(group.fromAccountId).transferOutTotal = group._sum.amount ?? 0;
  });

  return totalsByAccount;
};

const getAccounts = async (
  user: Omit<User, "password">,
  options: {
    includeArchived?: boolean;
  } = {},
) => {
  const accounts = await prisma.account.findMany({
    where: {
      userId: user.id,
      ...(options.includeArchived ? {} : { isArchived: false }),
    },
    select: accountSelect,
    orderBy: [{ isArchived: "asc" }, { createdAt: "asc" }],
  });

  const totalsByAccount = await getAccountTotals(
    user.id,
    accounts.map((account) => account.id),
  );

  return accounts.map((account) =>
    formatAccountSnapshot(
      account,
      totalsByAccount.get(account.id) ?? {
        incomeTotal: 0,
        expenseTotal: 0,
        transferInTotal: 0,
        transferOutTotal: 0,
      },
    ),
  );
};

const getAccountSnapshot = async (userId: number, accountId: number) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: accountSelect,
  });

  if (!account) {
    throw new HttpException(404, "Счет не найден", "ACCOUNT_NOT_FOUND");
  }

  const totalsByAccount = await getAccountTotals(userId, [account.id]);
  return formatAccountSnapshot(
    account,
    totalsByAccount.get(account.id) ?? {
      incomeTotal: 0,
      expenseTotal: 0,
      transferInTotal: 0,
      transferOutTotal: 0,
    },
  );
};

const assertAccountAccess = async (
  userId: number,
  accountId: number,
  options: {
    allowArchived?: boolean;
  } = {},
): Promise<Account> => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new HttpException(404, "Счет не найден", "ACCOUNT_NOT_FOUND");
  }

  if (!options.allowArchived && account.isArchived) {
    throw new HttpException(400, "Счет архивирован", "ACCOUNT_ARCHIVED");
  }

  return account;
};

const createAccount = async (
  user: Omit<User, "password">,
  payload: CreateAccountDTO,
) => {
  console.log(user);
  const account = await prisma.account.create({
    data: {
      name: payload.name,
      type: payload.type,
      currency: payload.currency ?? "RUB",
      openingBalance: payload.openingBalance ?? 0,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
    select: accountSelect,
  });

  return formatAccountSnapshot(account, {
    incomeTotal: 0,
    expenseTotal: 0,
    transferInTotal: 0,
    transferOutTotal: 0,
  });
};

const updateAccount = async (
  user: Omit<User, "password">,
  accountId: number,
  payload: UpdateAccountDTO,
) => {
  await assertAccountAccess(user.id, accountId, {
    allowArchived: true,
  });

  await prisma.account.update({
    where: {
      id: accountId,
    },
    data: {
      ...payload,
      currency: payload.currency ?? undefined,
      openingBalance: payload.openingBalance,
    },
  });

  return getAccountSnapshot(user.id, accountId);
};

const archiveAccount = async (
  user: Omit<User, "password">,
  accountId: number,
) => {
  const account = await assertAccountAccess(user.id, accountId, {
    allowArchived: true,
  });

  if (account.isArchived) {
    return getAccountSnapshot(user.id, accountId);
  }

  const activeAccounts = await prisma.account.count({
    where: {
      userId: user.id,
      isArchived: false,
    },
  });

  if (activeAccounts <= 1) {
    throw new HttpException(
      400,
      "Нельзя архивировать последний активный счет",
      "LAST_ACTIVE_ACCOUNT",
    );
  }

  await prisma.account.update({
    where: {
      id: accountId,
    },
    data: {
      isArchived: true,
    },
  });

  return getAccountSnapshot(user.id, accountId);
};

export {
  archiveAccount,
  assertAccountAccess,
  createAccount,
  getAccountSnapshot,
  getAccounts,
  updateAccount,
};
