import z from "zod";

export const SUBSCRIPTION_BILLING_CYCLES = ["monthly", "yearly"] as const;

export const SUBSCRIPTION_BILLING_CYCLE_LABELS: Record<(typeof SUBSCRIPTION_BILLING_CYCLES)[number], string> = {
  monthly: "Ежемесячно",
  yearly: "Раз в год",
};

export const SUBSCRIPTION_CATEGORY_TAGS = ["JOY", "TRANSPORT", "FOOD", "EDUCATION", "HOUSING", "OTHER"] as const;

export const SUBSCRIPTION_CATEGORY_LABELS: Record<(typeof SUBSCRIPTION_CATEGORY_TAGS)[number], string> = {
  FOOD: "Еда",
  HOUSING: "Жильё",
  TRANSPORT: "Транспорт",
  EDUCATION: "Обучение",
  JOY: "Досуг",
  OTHER: "Другое",
};

export const subscriptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.number(),
  billingCycle: z.enum(SUBSCRIPTION_BILLING_CYCLES),
  nextChargeDate: z.string(),
  categoryTag: z.enum(SUBSCRIPTION_CATEGORY_TAGS),
  accountId: z.number(),
  isActive: z.boolean(),
});

export const subscriptionFormSchema = subscriptionSchema
  .omit({
    id: true,
  })
  .extend({
    name: z.string().trim().min(2, "Минимум 2 символа"),
    amount: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : Number(value)),
      z.number().positive("Сумма должна быть положительной"),
    ),
    nextChargeDate: z
      .string()
      .min(1, "Выберите дату списания")
      .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
        message: "Некорректная дата",
      }),
    accountId: z.preprocess((value) => Number(value), z.number().int().positive("Выберите счёт")),
    isActive: z.preprocess((value) => value === true || value === "true", z.boolean()),
  });
