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
  name: z.string(),
  tag: z.enum(TransactionTags),
  price: z.number().positive(),
  date: z.string(),
});

export const transactionGetSchema = transactionSchema.extend({
  date: z.string().transform((str) => new Date(str)),
});
