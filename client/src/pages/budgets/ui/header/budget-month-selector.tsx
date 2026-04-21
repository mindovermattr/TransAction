import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { currentMonthValue, formatMonthLabel, shiftMonthValue } from "../../lib";

const BudgetMonthSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const isCurrentMonth = value === currentMonthValue;

  return (
    <div className="bg-card flex items-center gap-1 rounded-xl border p-1 shadow-xs">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg"
        onClick={() => onChange(shiftMonthValue(value, -1))}
      >
        <ChevronLeftIcon />
      </Button>
      <div className="min-w-[148px] px-2 text-center">
        <Typography tag="p" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Период
        </Typography>
        <Typography tag="p" className="text-sm font-semibold">
          {formatMonthLabel(value)}
        </Typography>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg"
        onClick={() => onChange(shiftMonthValue(value, 1))}
      >
        <ChevronRightIcon />
      </Button>
      <div className="hidden pl-1 sm:block">
        <Button
          type="button"
          variant={isCurrentMonth ? "secondary" : "outline"}
          size="sm"
          className="rounded-lg"
          onClick={() => onChange(currentMonthValue)}
          disabled={isCurrentMonth}
        >
          Текущий
        </Button>
      </div>
    </div>
  );
};

export { BudgetMonthSelector };
