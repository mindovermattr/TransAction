import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { currentMonthValue, formatMonthLabel, shiftMonthValue } from "@/lib/date";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const BudgetMonthSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const isCurrentMonth = value === currentMonthValue;

  return (
    <div className="bg-card/70 border-border/70 flex min-w-0 items-center gap-1 rounded-xl border p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground size-8 rounded-lg"
        onClick={() => onChange(shiftMonthValue(value, -1))}
      >
        <ChevronLeftIcon />
      </Button>
      <div className="min-w-[156px] px-2 text-center sm:min-w-[176px]">
        <Typography tag="p" className="text-xs leading-tight font-semibold">
          {formatMonthLabel(value)}
        </Typography>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground size-8 rounded-lg"
        onClick={() => onChange(shiftMonthValue(value, 1))}
      >
        <ChevronRightIcon />
      </Button>
      <div className="bg-border/70 ml-1 hidden h-6 w-px sm:block" />
      <div className="hidden sm:block">
        {isCurrentMonth ? (
          <div className="text-muted-foreground flex items-center px-2.5 text-xs font-medium">Текущий</div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-lg px-2.5"
            onClick={() => onChange(currentMonthValue)}
          >
            К текущему
          </Button>
        )}
      </div>
    </div>
  );
};

export { BudgetMonthSelector };
