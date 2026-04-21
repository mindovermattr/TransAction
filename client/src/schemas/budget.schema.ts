import { TRANSACTION_TAGS } from "./transaction.schema";
import z from "zod";

export const BUDGET_STATUSES = ["ok", "warning", "over"] as const;
export const BUDGET_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const budgetSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  month: z.string().regex(BUDGET_MONTH_REGEX, "Неверный формат месяца"),
  tag: z.enum(TRANSACTION_TAGS),
  limit: z.number().positive(),
  isArchived: z.boolean(),
  userId: z.number(),
  spent: z.number(),
  remaining: z.number(),
  progressPercent: z.number(),
  status: z.enum(BUDGET_STATUSES),
});

export const budgetGetSchema = budgetSchema.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const budgetPostSchema = budgetSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isArchived: true,
    userId: true,
    spent: true,
    remaining: true,
    progressPercent: true,
    status: true,
  })
  .extend({
    month: z.string().regex(BUDGET_MONTH_REGEX, "Выберите месяц в формате ГГГГ-ММ"),
    limit: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : Number(value)),
      z.number().int().positive("Лимит должен быть положительным"),
    ),
  });

export const budgetsResponseSchema = z.object({
  month: z.string().regex(BUDGET_MONTH_REGEX),
  summary: z.object({
    totalLimit: z.number(),
    totalSpent: z.number(),
    totalRemaining: z.number(),
    overCount: z.number(),
    warningCount: z.number(),
    activeCount: z.number(),
  }),
  items: z.array(budgetGetSchema),
});
