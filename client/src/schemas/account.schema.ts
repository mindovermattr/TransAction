import z from "zod";

export const ACCOUNT_TYPES = ["cash", "debit", "savings", "credit"] as const;

export const ACCOUNT_TYPE_LABELS: Record<(typeof ACCOUNT_TYPES)[number], string> = {
  cash: "Наличные",
  debit: "Дебетовая карта",
  savings: "Накопительный",
  credit: "Кредитка",
};

export const accountReferenceSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(ACCOUNT_TYPES),
  isArchived: z.boolean(),
});

export const accountSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  type: z.enum(ACCOUNT_TYPES),
  currency: z.string(),
  openingBalance: z.number(),
  isArchived: z.boolean(),
  userId: z.number(),
  currentBalance: z.number(),
  incomeTotal: z.number(),
  expenseTotal: z.number(),
  transferInTotal: z.number(),
  transferOutTotal: z.number(),
});

export const accountGetSchema = accountSchema.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const accountPostSchema = accountSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    userId: true,
    isArchived: true,
    currentBalance: true,
    incomeTotal: true,
    expenseTotal: true,
    transferInTotal: true,
    transferOutTotal: true,
  })
  .extend({
    name: z.string().min(2, "Минимум 2 символа"),
    currency: z.string().default("RUB"),
    openingBalance: z.preprocess(
      (val) => (val === "" || val === undefined ? 0 : Number(val)),
      z.number().min(0, "Баланс не может быть отрицательным"),
    ),
  });

export const transferSchema = z
  .object({
    id: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    amount: z.number(),
    date: z.string(),
    note: z.string().nullable().optional(),
    userId: z.number(),
    fromAccountId: z.number(),
    toAccountId: z.number(),
    fromAccount: accountReferenceSchema,
    toAccount: accountReferenceSchema,
  })
  .extend({
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    date: z.coerce.date(),
  });

export const transferPostSchema = transferSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    userId: true,
    fromAccount: true,
    toAccount: true,
  })
  .extend({
    date: z.string(),
    amount: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().positive("Сумма должна быть положительной"),
    ),
    fromAccountId: z.preprocess((val) => Number(val), z.number().int().positive("Выберите счет списания")),
    toAccountId: z.preprocess((val) => Number(val), z.number().int().positive("Выберите счет зачисления")),
    note: z.string().trim().max(120, "Максимум 120 символов").optional().or(z.literal("")),
  })
  .refine((value) => value.fromAccountId !== value.toAccountId, {
    message: "Счета должны отличаться",
    path: ["toAccountId"],
  });
