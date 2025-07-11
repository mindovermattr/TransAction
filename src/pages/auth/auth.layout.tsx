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
  description: React.ReactNode;
  footerText: React.ReactNode;
}

export const AuthLayout = ({ form, title, description, footerText }: Props) => {
  return (
    <main className="flex h-full grow items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{form}</CardContent>
        <CardFooter className="flex-col gap-2">{footerText}</CardFooter>
      </Card>
    </main>
  );
};
