import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { UseFormReturn } from "react-hook-form";
import type { BudgetFormInput, BudgetFormValues, BudgetMonthOption } from "../../lib";
import { BudgetEditorDialogForm } from "./budget-editor-dialog-form";

const BudgetCreateDialog = ({
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
        title="Новый бюджет"
        description="Настрой лимит по категории и сразу увидишь перерасход на странице бюджета."
        monthOptions={monthOptions}
        submitLabel="Создать бюджет"
        submitPending={submitPending}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
      />
    </DialogContent>
  </Dialog>
);

export { BudgetCreateDialog };
