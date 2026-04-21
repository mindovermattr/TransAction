import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type AnalyticsCardShellProps = {
  title: string;
  subtitle?: string;
  summary?: ReactNode;
  actions?: ReactNode;
  isInitialLoading: boolean;
  isRefreshing?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  loadingContent?: ReactNode;
  emptyContent?: ReactNode;
  errorContent?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
};

const DefaultSkeleton = () => (
  <Card className="flex min-h-[420px] flex-col">
    <CardHeader className="space-y-2">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-full min-h-[220px] w-full" />
    </CardContent>
  </Card>
);

const AnalyticsCardShell = ({
  title,
  subtitle,
  summary,
  actions,
  isInitialLoading,
  isRefreshing,
  isError,
  isEmpty,
  loadingContent,
  emptyContent,
  errorContent,
  children,
  className,
  contentClassName,
}: AnalyticsCardShellProps) => {
  if (isInitialLoading) {
    return loadingContent ? loadingContent : <DefaultSkeleton />;
  }

  const shouldShowStatus = isRefreshing && !isInitialLoading;

  return (
    <Card className={cn("relative flex min-h-[420px] flex-col", className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
            {subtitle ? (
              <Typography tag="p" className="text-muted-foreground text-xs">
                {subtitle}
              </Typography>
            ) : null}
          </div>
          {actions}
        </div>
        {summary}
      </CardHeader>
      <CardContent className={cn("relative flex flex-1 flex-col", contentClassName)}>
        {isError ? errorContent : isEmpty ? emptyContent : children}
      </CardContent>

      {shouldShowStatus ? (
        <div className="bg-background/90 border-border/50 text-muted-foreground absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px]">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Обновление</span>
        </div>
      ) : null}
    </Card>
  );
};

export { AnalyticsCardShell };
