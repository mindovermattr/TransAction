import z from "zod";

export const TRANSACTION_TAGS = [
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
  tag: z.enum(TRANSACTION_TAGS),
  price: z.number().positive("Цена должна быть положительной"),
  date: z.string(),
  userId: z.number(),
});

export const transactionGetSchema = transactionSchema.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  date: z.coerce.date(),
});

export const transactionPostSchema = transactionSchema
  .omit({
    createdAt: true,
    id: true,
    updatedAt: true,
    userId: true,
  })
  .extend({
    price: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().positive("Цена должна быть положительной"),
    ),
    name: z.string().min(4, "Минимум 4 символа"),
  });
