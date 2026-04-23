import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { RepeatIcon } from "lucide-react";

const EmptySubscriptionsState = ({ onCreate }: { onCreate: () => void }) => (
  <Card className="gap-4 py-7">
    <CardHeader className="px-6">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary rounded-2xl p-3">
          <RepeatIcon className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Регулярные списания пока не настроены</CardTitle>
          <CardDescription className="mt-2 max-w-2xl">
            Добавьте Netflix, связь, аренду или другой повторяющийся расход. Страница покажет ближайшую нагрузку, риски
            и monthly recurring total без лишней аналитической перегрузки.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 px-6 pt-0">
      <div className="grid gap-3 md:grid-cols-3">
        {["Netflix", "Мобильная связь", "Аренда квартиры"].map((example) => (
          <div key={example} className="bg-muted/35 rounded-xl border px-4 py-3">
            <Typography tag="p" className="text-sm font-medium">
              {example}
            </Typography>
            <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
              Будет виден в ближайших списаниях и общей recurring-нагрузке.
            </Typography>
          </div>
        ))}
      </div>
      <Button onClick={onCreate}>
        <RepeatIcon className="h-4 w-4" />
        Добавить первую подписку
      </Button>
    </CardContent>
  </Card>
);

export { EmptySubscriptionsState };
