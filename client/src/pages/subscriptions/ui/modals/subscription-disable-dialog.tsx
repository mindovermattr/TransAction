import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SubscriptionDisableDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>Отключить подписку?</DialogTitle>
        <DialogDescription>
          Будущие автосписания остановятся, история останется в журнале. Позже подписку можно вернуть из таблицы.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Отмена
          </Button>
        </DialogClose>
        <Button variant="destructive" onClick={onConfirm}>
          Отключить
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export { SubscriptionDisableDialog };
