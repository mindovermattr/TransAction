import { budgetPostSchema } from "@/schemas/budget.schema";
import z from "zod";

type BudgetFormInput = z.input<typeof budgetPostSchema>;
type BudgetFormValues = z.output<typeof budgetPostSchema>;

type BudgetMonthOption = {
  value: string;
  label: string;
  isCurrent: boolean;
};

export type { BudgetFormInput, BudgetFormValues, BudgetMonthOption };
