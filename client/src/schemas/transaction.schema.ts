import z from "zod";

const TransactionTags = [
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
  date: z.string().transform((val) => new Date(val)),
});
