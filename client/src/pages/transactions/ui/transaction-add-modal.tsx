import { usePostTransactionsMutation } from "@/api/hooks/usePostTransactionMutation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TRANSACTION_TAGS,
  transactionPostSchema,
} from "@/schemas/transaction.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

type FormField = {
  name: keyof z.infer<typeof transactionPostSchema>;
  label: string;
} & (
  | {
      type: "text" | "number";
      placeholder?: string;
    }
  | {
      type: "date";
    }
  | {
      type: "select";
      options: typeof TRANSACTION_TAGS;
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
  {
    name: "tag",
    label: "Тег",
    type: "select",
    options: TRANSACTION_TAGS,
  },
] satisfies readonly FormField[];

/* TODO: Change component name */

const TransactionAddModal = () => {
  const [open, setIsOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(transactionPostSchema),
  });

  const postTransactionMutation = usePostTransactionsMutation();

  const submitHandler = async (data: z.infer<typeof transactionPostSchema>) => {
    await postTransactionMutation.mutateAsync({
      params: data,
    });
    setIsOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="self-center p-0">
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
              <DialogTitle>Добавить транзакцию</DialogTitle>
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
                        {formField.type === "select" ? (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Выберите тег" />
                            </SelectTrigger>
                            <SelectContent>
                              {formField.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={formField.type}
                            placeholder={formField.placeholder ?? ""}
                            {...field}
                          />
                        )}
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

export { TransactionAddModal };
