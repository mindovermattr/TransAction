import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const DashboardInsightCard = ({
  title,
  value,
  hint,
  className,
}: {
  title: string;
  value: string;
  hint: string;
  className?: string;
}) => (
  <div className={cn("bg-muted/45 rounded-lg border p-3.5", className)}>
    <Typography tag="p" className="text-muted-foreground text-xs">
      {title}
    </Typography>
    <Typography tag="p" className="mt-1 text-base font-semibold">
      {value}
    </Typography>
    <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
      {hint}
    </Typography>
  </div>
);

export { DashboardInsightCard };
