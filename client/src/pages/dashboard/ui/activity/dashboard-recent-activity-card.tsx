import { TRANSACTION_TAGS_ICONS } from "@/constants/transaction-tags-icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
  dashboardCurrencyFormatter,
  formatDashboardCategoryLabel,
  formatDashboardDateLabel,
} from "../dashboard.formatters";

const DashboardRecentActivityCard = ({
  data,
}: {
  data: DashboardOverviewResponse["recentActivity"];
}) => (
  <Card className="gap-4 py-5">
    <CardHeader className="px-5">
      <CardTitle>Последние операции</CardTitle>
      <Typography tag="p" className="text-muted-foreground text-sm">
        Доходы и расходы в одной ленте
      </Typography>
    </CardHeader>
    <CardContent className="px-5 pt-0">
      {data.length === 0 ? (
        <div className="text-muted-foreground flex h-[280px] items-center justify-center text-sm">
          Пока нет операций. Начните с первой записи.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => {
            const Icon =
              item.type === "expense"
                ? item.tag
                  ? TRANSACTION_TAGS_ICONS[item.tag]
                  : ArrowDownIcon
                : ArrowUpIcon;

            return (
              <div key={item.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border",
                      item.type === "income"
                        ? "dark:bg-emerald-500/10 dark:text-emerald-600"
                        : "dark:bg-rose-500/10 dark:text-rose-600",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Typography
                        tag="p"
                        className="truncate text-sm font-medium"
                      >
                        {item.name}
                      </Typography>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full",
                          item.type === "income"
                            ? "border-emerald-200 text-emerald-700"
                            : "border-rose-200 dark:text-rose-700",
                        )}
                      >
                        {item.type === "income" ? "Доход" : "Расход"}
                      </Badge>
                    </div>
                    <Typography
                      tag="p"
                      className="text-muted-foreground text-xs"
                    >
                      {formatDashboardDateLabel(item.date)}
                      {item.tag
                        ? ` • ${formatDashboardCategoryLabel(item.tag)}`
                        : ""}
                    </Typography>
                  </div>

                  <Typography
                    tag="p"
                    className={cn(
                      "text-sm font-semibold",
                      item.type === "income"
                        ? "text-emerald-600"
                        : "text-foreground",
                    )}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {dashboardCurrencyFormatter.format(item.amount)}
                  </Typography>
                </div>
                {index < data.length - 1 ? (
                  <Separator className="mt-3" />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
);

export { DashboardRecentActivityCard };
