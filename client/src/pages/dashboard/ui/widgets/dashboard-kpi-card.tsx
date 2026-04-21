import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const KPI_TONE_STYLES = {
  balance: {
    card: "border-border bg-card shadow-sm",
    iconWrap: "border-border bg-muted/35 shadow-sm",
    icon: "text-violet-600",
  },
  income: {
    card: "border-border bg-card shadow-sm",
    iconWrap: "border-border bg-muted/35 shadow-sm",
    icon: "text-emerald-400",
  },
  expense: {
    card: "border-border bg-card shadow-sm",
    iconWrap: "border-border bg-muted/35 shadow-sm",
    icon: "text-rose-600 ",
  },
} as const;

const DashboardKpiCard = ({
  title,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: keyof typeof KPI_TONE_STYLES;
}) => (
  <Card
    className={cn(
      "group gap-3 overflow-hidden py-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md",
      KPI_TONE_STYLES[tone].card,
    )}
  >
    <CardHeader className="flex flex-row items-start justify-between gap-3 px-5">
      <div className="space-y-2">
        <Typography tag="p" className="text-muted-foreground text-sm">
          {title}
        </Typography>
        <Typography tag="p" className="text-3xl font-semibold tracking-tight">
          {value}
        </Typography>
      </div>
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-200 group-hover:scale-[1.03]",
          KPI_TONE_STYLES[tone].iconWrap,
        )}
      >
        <Icon className={cn("h-5 w-5", KPI_TONE_STYLES[tone].icon)} />
      </div>
    </CardHeader>
    <CardContent className="px-5">
      <Typography tag="p" className="text-muted-foreground text-sm">
        {detail}
      </Typography>
    </CardContent>
  </Card>
);

export { DashboardKpiCard };
