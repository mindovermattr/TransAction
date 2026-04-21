import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

const BudgetAlertCard = ({
  title,
  hint,
  className,
  valueClassName,
}: {
  title: string;
  hint: string;
  className: string;
  valueClassName: string;
}) => (
  <Card className={`gap-3 py-5 ${className}`}>
    <CardHeader className="px-5 pb-0">
      <Typography tag="p" className="text-muted-foreground text-xs">
        Что важно сейчас
      </Typography>
      <CardTitle className={`text-xl ${valueClassName}`}>{title}</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pt-0">
      <Typography tag="p" className="text-muted-foreground text-sm">
        {hint}
      </Typography>
    </CardContent>
  </Card>
);

export { BudgetAlertCard };
