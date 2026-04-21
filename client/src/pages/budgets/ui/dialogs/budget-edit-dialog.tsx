import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { BudgetFormInput, BudgetFormValues, BudgetMonthOption } from "../../lib";
import { BudgetEditorDialogForm } from "./budget-editor-dialog-form";

const BudgetEditDialog = ({
  open,
  onOpenChange,
  form,
  monthOptions,
  submitPending,
  errorMessage,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<BudgetFormInput, undefined, BudgetFormValues>;
  monthOptions: BudgetMonthOption[];
  submitPending: boolean;
  errorMessage: string | null;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-xl">
      <BudgetEditorDialogForm
        form={form}
        title="Редактировать бюджет"
        description="Измени период, категорию или лимит. Статус на странице пересчитается сразу."
        monthOptions={monthOptions}
        submitLabel="Сохранить изменения"
        submitPending={submitPending}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
      />
    </DialogContent>
  </Dialog>
);

export { BudgetEditDialog };
