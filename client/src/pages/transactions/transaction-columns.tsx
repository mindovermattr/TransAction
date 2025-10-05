import { Badge } from "@/components/ui/badge";
import { TRANSACTION_TAGS_ICONS } from "@/constants/transaction-tags-icons";
import type { transactionGetSchema } from "@/schemas/transaction.schema";
import type { ColumnDef } from "@tanstack/react-table";
import type z from "zod";

type TransactionColumnView = z.infer<typeof transactionGetSchema>;

export const columns: ColumnDef<TransactionColumnView>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Имя",
    enableSorting: false,
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Сумма",
    cell: ({ getValue }) => {
      const amount = parseFloat(getValue() as string);
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
      }).format(amount);
      return <div>{formatted}</div>;
    },
    sortingFn: "basic",
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Дата",
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      return date.toLocaleDateString("ru-RU");
    },
    sortingFn: "datetime",
  },
  {
    id: "tag",
    accessorKey: "tag",
    header: "Тэг",
    enableSorting: false,
    cell: ({ row }) => {
      const value = row.original.tag as keyof typeof TRANSACTION_TAGS_ICONS;
      const IconComponent =
        TRANSACTION_TAGS_ICONS[value] ?? TRANSACTION_TAGS_ICONS.OTHER;
      return (
        <Badge>
          <IconComponent />
          {value}
        </Badge>
      );
    },
    meta: {
      filterVariant: "select",
    },
  },
];
