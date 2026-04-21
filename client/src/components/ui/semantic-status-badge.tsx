import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const toneClasses = {
  ok: "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300",
  warning:
    "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300",
  danger: "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300",
  info: "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-300",
} as const;

type SemanticTone = keyof typeof toneClasses;

const SemanticStatusBadge = ({
  tone,
  className,
  ...props
}: ComponentProps<typeof Badge> & {
  tone: SemanticTone;
}) => <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", toneClasses[tone], className)} {...props} />;

export { SemanticStatusBadge };
export type { SemanticTone };
