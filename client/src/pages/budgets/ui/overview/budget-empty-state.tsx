import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { PiggyBankIcon } from "lucide-react";

const BudgetEmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <Card className="py-6">
    <CardContent className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <div className="bg-muted mb-4 rounded-full p-3">
        <PiggyBankIcon className="text-muted-foreground h-6 w-6" />
      </div>
      <Typography tag="h2" className="text-lg font-semibold">
        На этот месяц бюджеты не созданы
      </Typography>
      <Typography tag="p" className="text-muted-foreground mt-2 max-w-md text-sm">
        Добавьте лимиты по категориям, чтобы видеть перерасход заранее. Обычно начинают с еды, жилья и транспорта.
      </Typography>
      <Button className="mt-4" onClick={onCreate}>
        Создать первый бюджет
      </Button>
    </CardContent>
  </Card>
);

export { BudgetEmptyState };
