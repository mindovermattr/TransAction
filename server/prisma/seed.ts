import { Prisma, PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import * as argon2 from "argon2";

const prisma = new PrismaClient().$extends(withAccelerate());

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

const transactionData: Prisma.TransactionCreateInput[] = [
  ...Array.from({ length: 30 }, (_, i) => ({
    name: `Transaction June ${i + 1}`,
    tag: ["JOY", "TRANSPORT", "FOOD", "EDUCATION", "HOUSING", "OTHER"][
      Math.floor(Math.random() * 6)
    ] as any,
    price: Math.floor(Math.random() * 1000) + 100,
    date: new Date(2025, 5, i + 1),
    user: { connect: { email: "test@test.com" } },
  })),

  ...Array.from({ length: 30 }, (_, i) => ({
    name: `Transaction July ${i + 1}`,
    tag: ["JOY", "TRANSPORT", "FOOD", "EDUCATION", "HOUSING", "OTHER"][
      Math.floor(Math.random() * 6)
    ] as any,
    price: Math.floor(Math.random() * 1000) + 100,
    date: new Date(2025, 6, i + 1),
    user: { connect: { email: "test@test.com" } },
  })),
];

const incomeData: Prisma.IncomeCreateInput[] = [
  ...Array.from({ length: 12 }, (_, i) => ({
    name: `Income ${i + 1}`,
    price: Math.floor(Math.random() * 1000) + 100,
    date: new Date(2025, i, i),
    user: { connect: { email: "test@test.com" } },
  })),
];

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

  for (let i = 0; i < transactionData.length; i++) {
    const t = transactionData[i];
    const transaction = await prisma.transaction.upsert({
      create: t,
      where: {
        id: i,
      },
      update: t,
    });
    console.log(`Created transaction with id: ${transaction.id}`);
  }
  for (let i = 0; i < incomeData.length; i++) {
    const income = incomeData[i];
    const incomeCreated = await prisma.income.upsert({
      create: income,
      where: {
        id: i,
      },
      update: income,
    });
    console.log(`Created income with id: ${incomeCreated.id}`);
  }
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
