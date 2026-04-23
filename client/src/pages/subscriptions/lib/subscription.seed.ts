import type { SubscriptionRecord } from "@/schemas/subscription.schema";
import { addDays, startOfDay, toDateInputValue } from "@/lib/date";
import { FALLBACK_ACCOUNTS, type SubscriptionAccountOption } from "./subscription.constants";

const createSeedSubscriptions = (accounts: SubscriptionAccountOption[]) => {
  const primaryAccount = accounts[0]?.id ?? FALLBACK_ACCOUNTS[0].id;
  const savingsAccount = accounts[1]?.id ?? primaryAccount;
  const cashAccount = accounts[2]?.id ?? primaryAccount;
  const today = startOfDay(new Date());

  return [
    {
      id: 1,
      name: "Netflix",
      amount: 1299,
      billingCycle: "monthly",
      nextChargeDate: toDateInputValue(addDays(today, 1)),
      categoryTag: "JOY",
      accountId: primaryAccount,
      isActive: true,
    },
    {
      id: 2,
      name: "Яндекс Плюс",
      amount: 399,
      billingCycle: "monthly",
      nextChargeDate: toDateInputValue(addDays(today, 3)),
      categoryTag: "OTHER",
      accountId: primaryAccount,
      isActive: true,
    },
    {
      id: 3,
      name: "Аренда квартиры",
      amount: 32000,
      billingCycle: "monthly",
      nextChargeDate: toDateInputValue(addDays(today, 5)),
      categoryTag: "HOUSING",
      accountId: savingsAccount,
      isActive: true,
    },
    {
      id: 4,
      name: "Спортзал",
      amount: 2200,
      billingCycle: "monthly",
      nextChargeDate: toDateInputValue(addDays(today, 11)),
      categoryTag: "JOY",
      accountId: cashAccount,
      isActive: true,
    },
    {
      id: 5,
      name: "iCloud+",
      amount: 8990,
      billingCycle: "yearly",
      nextChargeDate: toDateInputValue(addDays(today, 24)),
      categoryTag: "OTHER",
      accountId: primaryAccount,
      isActive: true,
    },
    {
      id: 6,
      name: "Coursera",
      amount: 6490,
      billingCycle: "yearly",
      nextChargeDate: toDateInputValue(addDays(today, 52)),
      categoryTag: "EDUCATION",
      accountId: primaryAccount,
      isActive: false,
    },
  ] satisfies SubscriptionRecord[];
};

export { createSeedSubscriptions };
