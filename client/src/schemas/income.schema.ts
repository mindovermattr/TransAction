import z from "zod";
import { accountReferenceSchema } from "./account.schema";

export const incomeSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  price: z.number().positive("Цена должна быть положительной"),
  date: z.string(),
  userId: z.number(),
  accountId: z.number(),
  account: accountReferenceSchema,
});

export const incomeGetSchema = incomeSchema.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  date: z.coerce.date(),
});

export const incomePostSchema = incomeSchema
  .omit({
    createdAt: true,
    id: true,
    updatedAt: true,
    userId: true,
    account: true,
  })
  .extend({
    price: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().positive("Цена должна быть положительной"),
    ),
    name: z.string().min(4, "Минимум 4 символа"),
    accountId: z.preprocess((val) => Number(val), z.number().int().positive("Выберите счет")),
  });
