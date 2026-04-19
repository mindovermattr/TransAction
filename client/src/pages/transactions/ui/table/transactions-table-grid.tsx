import {
  flexRender,
  type Header,
  type Row,
  type Table as TanStackTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
} from "lucide-react";
import { columns } from "../../transaction-columns";
import type { TransactionRow } from "./transaction-table.types";

const SORT_ICON_MAP = {
  asc: <ArrowUpIcon className="h-4 w-4" />,
  desc: <ArrowDownIcon className="h-4 w-4" />,
} as const;

type SortableTableHeadProps = {
  header: Header<TransactionRow, unknown>;
};

const SortableTableHead = ({ header }: SortableTableHeadProps) => {
  const sorted = header.column.getIsSorted();
  const canSort = header.column.getCanSort();

  return (
    <TableHead
      className="bg-card sticky top-0 z-10"
      onClick={() => {
        if (canSort) {
          header.column.toggleSorting();
        }
      }}
    >
      <div className="flex items-center gap-1">
        {!header.isPlaceholder &&
          flexRender(header.column.columnDef.header, header.getContext())}
        {canSort &&
          (sorted
            ? SORT_ICON_MAP[sorted as keyof typeof SORT_ICON_MAP]
            : <ArrowUpDownIcon className="h-4 w-4" />)}
      </div>
    </TableHead>
  );
};

type TransactionsTableGridProps = {
  table: TanStackTable<TransactionRow>;
  rows: Row<TransactionRow>[];
  hasAnyTransactions: boolean;
};

const TransactionsTableGrid = ({
  table,
  rows,
  hasAnyTransactions,
}: TransactionsTableGridProps) => {
  const emptyStateText = !hasAnyTransactions
    ? "Пока нет транзакций. Добавьте первую запись."
    : "По заданным фильтрам ничего не найдено";

  return (
    <div className="max-h-[560px] rounded-md border">
      <Table className="[&_td]:px-3 [&_td]:py-2 [&_th]:h-9 [&_th]:px-3">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <SortableTableHead key={header.id} header={header} />
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyStateText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export { TransactionsTableGrid };
