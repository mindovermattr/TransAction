import {
  AccountType,
  Prisma,
  PrismaClient,
  TransactionTag,
} from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import * as argon2 from "argon2";

const prisma = new PrismaClient().$extends(withAccelerate());

const TAGS: TransactionTag[] = [
  TransactionTag.JOY,
  TransactionTag.TRANSPORT,
  TransactionTag.FOOD,
  TransactionTag.EDUCATION,
  TransactionTag.HOUSING,
  TransactionTag.OTHER,
];

const TRANSACTION_TITLES = [
  "Groceries",
  "Coffee",
  "Taxi",
  "Subscription",
  "Restaurant",
  "Pharmacy",
  "Fuel",
  "Books",
  "Cinema",
  "Utilities",
];

const INCOME_TITLES = ["Salary", "Freelance", "Bonus", "Cashback"];

const ACCOUNT_TEMPLATES: Array<{
  name: string;
  type: AccountType;
  openingBalance: number;
}> = [
  {
    name: "Основная карта",
    type: AccountType.debit,
    openingBalance: 125_000,
  },
  {
    name: "Наличные",
    type: AccountType.cash,
    openingBalance: 18_000,
  },
  {
    name: "Подушка",
    type: AccountType.savings,
    openingBalance: 320_000,
  },
];

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Alice",
    email: "alice@prisma.io",
    password: "123154215",
  },
  {
    name: "Nilu",
    email: "nilu@prisma.io",
    password: "123154215",
  },
  {
    name: "dmitriy",
    email: "test@test.com",
    password: "123456",
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

function endOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function generateMonthTransactions(
  startDate: Date,
  endDate: Date,
  userId: number,
  accountIds: number[],
): Prisma.TransactionCreateManyInput[] {
  const daysInMonth = endDate.getUTCDate();
  const count = randomInt(24, 40);

  return Array.from({ length: count }, (_, i) => {
    const day = randomInt(0, daysInMonth - 1);
    const date = addDays(startDate, day);

    return {
      name: `${TRANSACTION_TITLES[randomInt(0, TRANSACTION_TITLES.length - 1)]} #${
        i + 1
      }`,
      tag: TAGS[randomInt(0, TAGS.length - 1)],
      price: randomInt(80, 4200),
      date,
      userId,
      accountId: accountIds[randomInt(0, accountIds.length - 1)],
    };
  });
}

function generateMonthIncomes(
  startDate: Date,
  userId: number,
  accountIds: number[],
): Prisma.IncomeCreateManyInput[] {
  const incomeCount = randomInt(2, 4);
  return Array.from({ length: incomeCount }, (_, i) => ({
    name: `${INCOME_TITLES[randomInt(0, INCOME_TITLES.length - 1)]} #${i + 1}`,
    price: randomInt(12000, 220000),
    date: addDays(startDate, randomInt(0, 27)),
    userId,
    accountId: accountIds[randomInt(0, accountIds.length - 1)],
  }));
}

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const hashPassword = await argon2.hash(u.password);
    const user = await prisma.user.upsert({
      create: {
        ...u,
        password: hashPassword,
      },
      where: {
        email: u.email,
      },
      update: {
        ...u,
        password: hashPassword,
      },
    });
    console.log(`Created user with id: ${user.id}`);
  }

  const seededUser = await prisma.user.findUniqueOrThrow({
    where: { email: "test@test.com" },
  });

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)),
  );
  const currentMonthEnd = endOfMonth(now);

  await prisma.transaction.deleteMany({
    where: {
      userId: seededUser.id,
      date: {
        gte: previousMonthStart,
        lte: currentMonthEnd,
      },
    },
  });

  await prisma.income.deleteMany({
    where: {
      userId: seededUser.id,
      date: {
        gte: previousMonthStart,
        lte: currentMonthEnd,
      },
    },
  });

  await prisma.transfer.deleteMany({
    where: {
      userId: seededUser.id,
    },
  });

  await prisma.budget.deleteMany({
    where: {
      userId: seededUser.id,
    },
  });

  await prisma.account.deleteMany({
    where: {
      userId: seededUser.id,
    },
  });

  await prisma.account.createMany({
    data: ACCOUNT_TEMPLATES.map((account) => ({
      ...account,
      currency: "RUB",
      userId: seededUser.id,
    })),
  });

  const accounts = await prisma.account.findMany({
    where: {
      userId: seededUser.id,
      isArchived: false,
    },
    orderBy: {
      id: "asc",
    },
  });
  const accountIds = accounts.map((account) => account.id);

  const transactionData: Prisma.TransactionCreateManyInput[] = [
    ...generateMonthTransactions(
      previousMonthStart,
      endOfMonth(previousMonthStart),
      seededUser.id,
      accountIds,
    ),
    ...generateMonthTransactions(
      currentMonthStart,
      currentMonthEnd,
      seededUser.id,
      accountIds,
    ),
  ];

  const incomeData: Prisma.IncomeCreateManyInput[] = [
    ...generateMonthIncomes(previousMonthStart, seededUser.id, accountIds),
    ...generateMonthIncomes(currentMonthStart, seededUser.id, accountIds),
  ];

  await prisma.transaction.createMany({ data: transactionData });
  await prisma.income.createMany({ data: incomeData });
  await prisma.transfer.createMany({
    data: [
      {
        userId: seededUser.id,
        fromAccountId: accounts[0].id,
        toAccountId: accounts[2].id,
        amount: 15000,
        date: addDays(previousMonthStart, 12),
        note: "Пополнение подушки",
      },
      {
        userId: seededUser.id,
        fromAccountId: accounts[0].id,
        toAccountId: accounts[1].id,
        amount: 8000,
        date: addDays(currentMonthStart, 6),
        note: "Снятие наличных",
      },
    ],
  });

  const currentMonthSpendByTag = (await prisma.transaction.groupBy({
    by: ["tag"],
    where: {
      userId: seededUser.id,
      date: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
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

  const spendByTag = new Map(
    currentMonthSpendByTag.map((entry) => [
      entry.tag,
      entry._sum.price ?? 0,
    ]),
  );

  const budgetPlan: Array<{ tag: TransactionTag; multiplier: number }> = [
    { tag: TransactionTag.FOOD, multiplier: 1.5 },
    { tag: TransactionTag.HOUSING, multiplier: 0.75 },
    { tag: TransactionTag.TRANSPORT, multiplier: 1.05 },
    { tag: TransactionTag.JOY, multiplier: 1.3 },
    { tag: TransactionTag.OTHER, multiplier: 0.9 },
  ];

  const minimumSpendByTag = new Map<TransactionTag, number>([
    [TransactionTag.FOOD, 18_000],
    [TransactionTag.HOUSING, 24_000],
    [TransactionTag.TRANSPORT, 12_000],
    [TransactionTag.JOY, 9_000],
    [TransactionTag.OTHER, 8_000],
  ]);

  await prisma.budget.createMany({
    data: budgetPlan.map((plan) => {
      const baseSpent = Math.max(
        spendByTag.get(plan.tag) ?? 0,
        minimumSpendByTag.get(plan.tag) ?? 10_000,
      );

      return {
        userId: seededUser.id,
        monthStart: currentMonthStart,
        tag: plan.tag,
        limit: Math.max(
          1_000,
          Math.round((baseSpent * plan.multiplier) / 100) * 100,
        ),
        isArchived: false,
      };
    }),
  });

  console.log(
    `Created ${accounts.length} accounts, ${transactionData.length} transactions, ${incomeData.length} incomes and budgets for ${seededUser.email}`,
  );
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
