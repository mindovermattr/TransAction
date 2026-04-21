import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type EmptyStateProps = {
  className?: string;
  message?: string;
  description?: string;
  variant?: "empty" | "error";
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState = ({
  className,
  message = "В выбранный период расходы не найдены",
  description,
  variant = "empty",
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const isError = variant === "error";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-12 text-center", className)}>
      <div className="bg-muted/50 rounded-full p-4">
        {isError ? (
          <AlertCircle className="text-muted-foreground h-8 w-8" />
        ) : (
          <BarChart3 className="text-muted-foreground h-8 w-8" />
        )}
      </div>
      <div className="space-y-2">
        <Typography tag="p" className="text-muted-foreground text-base font-medium">
          {message}
        </Typography>
        {description && (
          <Typography tag="p" className="text-muted-foreground/80 text-sm">
            {description}
          </Typography>
        )}
      </div>
      {onAction && actionLabel && (
        <Button variant="outline" onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export { EmptyState };
