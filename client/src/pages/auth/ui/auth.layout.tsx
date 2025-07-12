import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  form: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  footerText: React.ReactNode;
}

export const AuthLayout = ({ form, title, description, footerText }: Props) => {
  return (
    <main className="flex h-full grow items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="grid-rows-1 justify-items-center-safe">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{form}</CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-muted-foreground [&_a]:text-primary text-sm [&_a]:underline">
            {footerText}
          </p>
        </CardFooter>
      </Card>
    </main>
  );
};
