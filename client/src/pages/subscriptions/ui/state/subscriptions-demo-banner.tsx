import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { SparklesIcon } from "lucide-react";

const SubscriptionsDemoBanner = () => (
  <Card className="gap-3 border-dashed py-4">
    <CardContent className="px-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-2.5">
          <div className="rounded-full bg-sky-50 p-2 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
            <SparklesIcon className="h-4 w-4" />
          </div>
          <div>
            <Typography tag="p" className="text-sm font-medium">
              Локальный режим для демонстрации UX
            </Typography>
            <Typography tag="p" className="text-muted-foreground text-sm">
              Страница работает с локальными примерами, пока для подписок нет backend data layer.
            </Typography>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export { SubscriptionsDemoBanner };
