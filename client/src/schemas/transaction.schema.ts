import z from "zod";

export const TransactionTags = [
  "JOY",
  "TRANSPORT",
  "FOOD",
  "EDUCATION",
  "HOUSING",
  "OTHER",
] as const;

export const transactionSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  tag: z.enum(TransactionTags),
  price: z.number().positive(),
  date: z.string(),
  userId: z.number(),
});

export const transactionGetSchema = transactionSchema.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  date: z.coerce.date(),
});
