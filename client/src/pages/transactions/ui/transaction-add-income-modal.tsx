import { usePostIncomeMutation } from "@/api/hooks/income/usePostIncomeMutation";
import { queryClient } from "@/api/query-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { incomePostSchema } from "@/schemas/income.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

type FormField = {
  name: keyof z.infer<typeof incomePostSchema>;
  label: string;
} & (
  | {
      type: "text" | "number";
      placeholder?: string;
      value?: string | number;
    }
  | {
      type: "date";
      value?: string;
    }
);

const formFields = [
  {
    name: "name",
    label: "Имя",
    type: "text",
    placeholder: "Enter name",
  },
  { name: "date", label: "Дата", type: "date" },
  { name: "price", label: "Цена", type: "number", placeholder: "Цена" },
] satisfies readonly FormField[];

const TransactionAddIncomeModal = () => {
  const [open, setIsOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(incomePostSchema),
  });

  const postIncomeMutation = usePostIncomeMutation({
    options: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["income"] });
        setIsOpen(false);
        form.reset();
      },
    },
  });

  const submitHandler = async (data: z.infer<typeof incomePostSchema>) =>
    await postIncomeMutation.mutateAsync({
      params: data,
    });

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="ml-auto self-center">
          <CirclePlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitHandler)}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Добавить доход</DialogTitle>
            </DialogHeader>

            {formFields.map((formField) => (
              <FormField
                key={formField.name}
                control={form.control}
                name={formField.name}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>{formField.label}</FormLabel>
                      <FormControl>
                        <Input
                          type={formField.type}
                          placeholder={formField.placeholder ?? ""}
                          {...field}
                          value={field.value as string | number | undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            ))}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Закрыть</Button>
              </DialogClose>
              <Button type="submit">Добавить</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { TransactionAddIncomeModal };
