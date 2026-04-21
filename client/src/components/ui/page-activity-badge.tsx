import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

type PageActivityState = "idle" | "fetching" | "error";

const PAGE_ACTIVITY_STATE_MAP: Record<
  PageActivityState,
  {
    dotClassName: string;
    label: string;
  }
> = {
  idle: {
    dotClassName: "fill-emerald-500 text-emerald-500",
    label: "Актуально",
  },
  fetching: {
    dotClassName: "fill-amber-500 text-amber-500",
    label: "Обновление",
  },
  error: {
    dotClassName: "fill-amber-500 text-amber-500",
    label: "Ошибка загрузки",
  },
};

const PageActivityBadge = ({
  state = "idle",
  className,
}: {
  state?: PageActivityState;
  className?: string;
}) => {
  const config = PAGE_ACTIVITY_STATE_MAP[state];

  return (
    <Badge variant="outline" className={`gap-1.5 self-start rounded-full border-border/70 px-3 py-1 ${className ?? ""}`}>
      <Circle className={`h-2.5 w-2.5 ${config.dotClassName}`} />
      {config.label}
    </Badge>
  );
};

export { PageActivityBadge };
export type { PageActivityState };
