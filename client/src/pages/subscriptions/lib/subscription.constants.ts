import { accountReferenceSchema } from "@/schemas/account.schema";
import z from "zod";

type SubscriptionAccountOption = z.infer<typeof accountReferenceSchema>;

const FALLBACK_ACCOUNTS: SubscriptionAccountOption[] = [
  {
    id: 9001,
    name: "Основная карта",
    type: "debit",
    isArchived: false,
  },
  {
    id: 9002,
    name: "Накопительный",
    type: "savings",
    isArchived: false,
  },
  {
    id: 9003,
    name: "Наличные",
    type: "cash",
    isArchived: false,
  },
];

const SUBSCRIPTION_CATEGORY_COLORS = [
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-1)",
];

export { FALLBACK_ACCOUNTS, SUBSCRIPTION_CATEGORY_COLORS };
export type { SubscriptionAccountOption };
