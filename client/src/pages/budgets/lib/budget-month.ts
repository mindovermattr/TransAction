import { currentMonthValue, formatMonthLabel, shiftMonthValue } from "@/lib/date";
import type { BudgetMonthOption } from "./budget.types";

const getBudgetMonthOptions = (anchorMonth: string): BudgetMonthOption[] =>
  Array.from({ length: 8 }, (_, index) => {
    const value = shiftMonthValue(anchorMonth, index - 3);
    return {
      value,
      label: formatMonthLabel(value),
      isCurrent: value === currentMonthValue,
    };
  });

export { getBudgetMonthOptions };
