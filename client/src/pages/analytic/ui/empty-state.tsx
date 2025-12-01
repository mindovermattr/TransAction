import { Typography } from "@/components/ui/typography";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  className?: string;
  message?: string;
  description?: string;
};

const EmptyState = ({
  className,
  message = "В выбранный период расходы не найдены",
  description,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className,
      )}
    >
      <div className="bg-muted/50 rounded-full p-4">
        <BarChart3 className="text-muted-foreground h-8 w-8" />
      </div>
      <div className="space-y-2">
        <Typography
          tag="p"
          className="text-muted-foreground text-base font-medium"
        >
          {message}
        </Typography>
        {description && (
          <Typography tag="p" className="text-muted-foreground/80 text-sm">
            {description}
          </Typography>
        )}
      </div>
    </div>
  );
};

export { EmptyState };
