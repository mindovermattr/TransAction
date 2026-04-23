import { TRANSACTION_TAGS_ICONS } from "@/constants/transaction-tags-icons";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { formatMonthLabel } from "@/lib/date";
import { rubCurrencyFormatter } from "@/lib/formatters";
import { TRANSACTION_TAGS } from "@/schemas/transaction.schema";
import type { UseFormReturn } from "react-hook-form";
import { BUDGET_TAG_LABELS, type BudgetFormInput, type BudgetFormValues, type BudgetMonthOption } from "../../lib";

const BudgetEditorDialogForm = ({
  form,
  title,
  description,
  monthOptions,
  submitLabel,
  submitPending,
  errorMessage,
  onSubmit,
}: {
  form: UseFormReturn<BudgetFormInput, undefined, BudgetFormValues>;
  title: string;
  description: string;
  monthOptions: BudgetMonthOption[];
  submitLabel: string;
  submitPending: boolean;
  errorMessage: string | null;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
}) => {
  const selectedTag = form.watch("tag");
  const selectedMonth = form.watch("month");
  const selectedLimit = form.watch("limit");
  const SelectedTagIcon = TRANSACTION_TAGS_ICONS[selectedTag];

  return (
    <>
      <div className="bg-muted/35 border-b px-6 py-5">
        <DialogHeader className="gap-1 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="space-y-5 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Период</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="border-border/70 h-auto w-full rounded-xl px-3 py-3">
                          <div className="min-w-0 text-left">
                            <p className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">Месяц</p>
                            <p className="truncate text-sm font-medium">{formatMonthLabel(field.value)}</p>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex w-full items-center justify-between gap-3">
                                <span>{option.label}</span>
                                {option.isCurrent ? (
                                  <span className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
                                    Текущий
                                  </span>
                                ) : null}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>Бюджет считается на весь выбранный месяц.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => {
                  const CurrentTagIcon = TRANSACTION_TAGS_ICONS[field.value];

                  return (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="border-border/70 h-auto w-full rounded-xl px-3 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="bg-muted border-border/70 flex size-9 shrink-0 items-center justify-center rounded-lg border">
                                <CurrentTagIcon className="size-4" />
                              </div>
                              <div className="min-w-0 text-left">
                                <p className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
                                  Категория
                                </p>
                                <p className="truncate text-sm font-medium">{BUDGET_TAG_LABELS[field.value]}</p>
                              </div>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSACTION_TAGS.map((tag) => {
                              const TagIcon = TRANSACTION_TAGS_ICONS[tag];
                              return (
                                <SelectItem key={tag} value={tag}>
                                  <span className="flex items-center gap-2">
                                    <TagIcon className="size-4" />
                                    <span>{BUDGET_TAG_LABELS[tag]}</span>
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>Статус бюджета будет считаться по расходам этой категории.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="border-border/70 bg-muted/25 rounded-2xl border p-4">
              <div className="mb-4 flex items-start gap-3">
                <div className="bg-background border-border/70 flex size-10 shrink-0 items-center justify-center rounded-xl border">
                  <SelectedTagIcon className="size-4" />
                </div>
                <div>
                  <Typography tag="p" className="text-sm font-semibold">
                    {BUDGET_TAG_LABELS[selectedTag]}
                  </Typography>
                  <Typography tag="p" className="text-muted-foreground text-sm">
                    {selectedMonth ? formatMonthLabel(selectedMonth) : "Выберите период"}
                  </Typography>
                </div>
              </div>

              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Лимит на месяц</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg font-semibold">
                          ₽
                        </span>
                        <Input
                          type="number"
                          placeholder="15000"
                          {...field}
                          value={field.value as string | number | undefined}
                          className="border-border/70 h-14 rounded-xl pr-4 pl-10 text-lg font-semibold"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Остальное считаем автоматически: факт, остаток и статус риска.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="border-border/70 bg-background/80 rounded-xl border p-3">
                  <Typography tag="p" className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
                    Период
                  </Typography>
                  <Typography tag="p" className="mt-1 text-sm font-medium">
                    {selectedMonth ? formatMonthLabel(selectedMonth) : "Не выбран"}
                  </Typography>
                </div>
                <div className="border-border/70 bg-background/80 rounded-xl border p-3">
                  <Typography tag="p" className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
                    Плановый лимит
                  </Typography>
                  <Typography tag="p" className="mt-1 text-sm font-medium">
                    {typeof selectedLimit === "number" ? rubCurrencyFormatter.format(selectedLimit) : "Введите сумму"}
                  </Typography>
                </div>
              </div>
            </div>

            {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
          </div>

          <DialogFooter className="bg-muted/20 border-t px-6 py-4">
            <DialogClose asChild>
              <Button variant="outline">Закрыть</Button>
            </DialogClose>
            <Button type="submit" disabled={submitPending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export { BudgetEditorDialogForm };
