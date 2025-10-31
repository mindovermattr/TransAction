import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";

import { useGetTransactionsQuery } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import {
  TRANSACTION_TAGS,
  transactionGetSchema,
} from "@/schemas/transaction.schema";

import { TRANSACTION_TAGS_ICONS } from "@/constants/transaction-tags-icons";
import { SelectGroup } from "@radix-ui/react-select";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  FunnelXIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { columns } from "../transaction-columns";
import { TransactionAddModal } from "./transaction-add-modal";

type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

const TransactionTable = () => {
  const { data, isFetching } = useGetTransactionsQuery({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 13,
  });

  const [filterState, setFilterState] = useState<ColumnFiltersState>([]);
  const [selectedTag, setSelectedTag] = useState("");

  const transactions = useMemo(() => {
    if (!data) return [];

    const parsedBody = data.map((el) => transactionGetSchema.parse(el));
    return parsedBody;
  }, [data]);

  const table = useReactTable({
    data: transactions,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setFilterState,
    state: {
      pagination,
      columnFilters: filterState,
    },
    enableSorting: true,
  });

  const rows = table.getRowModel().rows;

  const handleFilterChange = (selectedItem: string) => {
    if (selectedItem === "ALL") {
      setSelectedTag("");
      setFilterState([]);
      return;
    }
    setSelectedTag(selectedItem);
    setFilterState([
      {
        id: "tag",
        value: selectedItem,
      },
    ]);
  };

  return (
    <Card className="relative gap-3">
      <CardHeader className="flex justify-between">
        <Typography tag="h3" variant="title" className="font-medium">
          Таблица расходов
        </Typography>
        <div className="flex gap-4">
          <Select value={selectedTag} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Тэг" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Фильтрация</SelectLabel>
                <SelectItem value="ALL">
                  <FunnelXIcon />
                  Показать все
                </SelectItem>
                <SelectSeparator />
                {TRANSACTION_TAGS.map((option) => {
                  const TagIcon = TRANSACTION_TAGS_ICONS[option];
                  return (
                    <SelectItem key={option} value={option}>
                      <TagIcon />
                      {option}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          <TransactionAddModal />
        </div>
      </CardHeader>
      <CardContent>
        {isFetching && (
          <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
            <Typography tag="span">Загрузка...</Typography>
          </div>
        )}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted() as
                      | "asc"
                      | "desc"; // TODO
                    const canSort = header.column.getCanSort();
                    const ICONS_MAP = {
                      asc: <ArrowDownIcon className="h-4 w-4" />,
                      desc: <ArrowUpIcon className="h-4 w-4" />,
                    } as const;
                    return (
                      <TableHead
                        key={header.id}
                        onClick={() => header.column.toggleSorting()}
                      >
                        <div className="flex cursor-pointer items-center gap-1">
                          {!header.isPlaceholder &&
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          {canSort &&
                            (ICONS_MAP[isSorted] ?? (
                              <ArrowUpDownIcon className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {/* TODO: Кнопки "прыгают" при неполном количестве транзакций на странице */}
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          size="sm"
        >
          <ArrowLeftIcon />
        </Button>
        <Typography tag="p" variant={"default"}>
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </Typography>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          size="sm"
        >
          <ArrowRightIcon />
        </Button>
      </CardFooter>
    </Card>
  );
};

export { TransactionTable };
