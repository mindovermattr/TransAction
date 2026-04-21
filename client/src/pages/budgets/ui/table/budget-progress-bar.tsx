import { getBudgetProgressBarClassName } from "../../lib";

const BudgetProgressBar = ({
  progressPercent,
  status,
}: {
  progressPercent: number;
  status: BudgetStatus;
}) => (
  <div className="space-y-1.5">
    <div className="bg-muted h-2.5 overflow-hidden rounded-full">
      <div
        className={`h-full rounded-full transition-[width] ${getBudgetProgressBarClassName(status)}`}
        style={{ width: `${Math.min(progressPercent, 100)}%` }}
      />
    </div>
    <div className="text-muted-foreground flex items-center justify-between text-xs">
      <span>{progressPercent}% лимита</span>
      {progressPercent > 100 ? <span>Перерасход</span> : null}
    </div>
  </div>
);

export { BudgetProgressBar };
