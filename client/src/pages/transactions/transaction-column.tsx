import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Имя",
    enableSorting: false, // Сортировка отключена
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
    enableMultiSort: false,
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
    enableMultiSort: false,
  },
  {
    id: "tag",
    accessorKey: "tag",
    header: "Тэг",
    sortingFn: "alphanumeric", // Явно указываем тип сортировки
  },
];
