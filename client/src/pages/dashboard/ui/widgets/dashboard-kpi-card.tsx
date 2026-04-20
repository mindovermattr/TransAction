import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { LucideIcon } from "lucide-react";

const DashboardKpiCard = ({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) => (
  <Card className="gap-3 py-5">
    <CardHeader className="flex flex-row items-start justify-between gap-3 px-5">
      <div className="space-y-1">
        <Typography tag="p" className="text-muted-foreground text-sm">
          {title}
        </Typography>
        <Typography tag="p" className="text-2xl font-semibold">
          {value}
        </Typography>
      </div>
      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
        <Icon className="h-5 w-5" />
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
