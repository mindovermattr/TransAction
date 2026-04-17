import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Header,
  type Row,
  type Table as TanStackTable,
} from "@tanstack/react-table";

import { useGetTransactionsQuery } from "@/api/hooks";
import { TRANSACTION_TAGS_ICONS } from "@/constants/transaction-tags-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { SelectGroup } from "@radix-ui/react-select";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CalendarRangeIcon,
  FunnelXIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { columns } from "../transaction-columns";
import { TransactionAddModal } from "./transaction-add-modal";

type TransactionRow = ReturnType<typeof transactionGetSchema.parse>;

type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

type DatePreset = "all" | "thisMonth" | "last30" | "last90" | "custom";

type TransactionFiltersState = {
  search: string;
  tag: "ALL" | TransactionTags;
  minAmount: string;
  maxAmount: string;
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
};

type NormalizedTransactionFilters = {
  search: string;
  tag: TransactionFiltersState["tag"];
  minAmount?: number;
  maxAmount?: number;
  from?: Date;
  to?: Date;
};

type FiltersPatch = Partial<TransactionFiltersState>;

const DEFAULT_FILTERS: TransactionFiltersState = {
  search: "",
  tag: "ALL",
  minAmount: "",
  maxAmount: "",
  datePreset: "all",
  dateFrom: "",
  dateTo: "",
};

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: "Все даты", value: "all" },
  { label: "Этот месяц", value: "thisMonth" },
  { label: "Последние 30 дней", value: "last30" },
  { label: "Последние 90 дней", value: "last90" },
  { label: "Пользовательский", value: "custom" },
];

const SORT_ICON_MAP = {
  asc: <ArrowUpIcon className="h-4 w-4" />,
  desc: <ArrowDownIcon className="h-4 w-4" />,
} as const;

const getPresetRange = (preset: DatePreset) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  if (preset === "thisMonth") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: undefined,
    };
  }

  if (preset === "last30") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 29);
    return { from, to: undefined };
  }

  if (preset === "last90") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 89);
    return { from, to: undefined };
  }

  return { from: undefined, to: undefined };
};

const parseOptionalAmount = (value: string) => {
  if (value === "") return undefined;

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeCustomDateRange = (filters: TransactionFiltersState) => {
  const from = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
  const to = filters.dateTo ? new Date(filters.dateTo) : undefined;

  if (to) {
    to.setHours(23, 59, 59, 999);
  }

  return { from, to };
};

const normalizeFilters = (
  filters: TransactionFiltersState,
): NormalizedTransactionFilters => {
  const minAmount = parseOptionalAmount(filters.minAmount);
  const maxAmount = parseOptionalAmount(filters.maxAmount);

  const dateRange =
    filters.datePreset === "custom"
      ? normalizeCustomDateRange(filters)
      : getPresetRange(filters.datePreset);

  return {
    search: filters.search.trim().toLowerCase(),
    tag: filters.tag,
    minAmount,
    maxAmount,
    ...dateRange,
  };
};

const matchesTransactionFilters = (
  transaction: TransactionRow,
  filters: NormalizedTransactionFilters,
) => {
  if (filters.search && !transaction.name.toLowerCase().includes(filters.search)) {
    return false;
  }

  if (filters.tag !== "ALL" && transaction.tag !== filters.tag) {
    return false;
  }

  if (
    typeof filters.minAmount === "number" &&
    transaction.price < filters.minAmount
  ) {
    return false;
  }

  if (
    typeof filters.maxAmount === "number" &&
    transaction.price > filters.maxAmount
  ) {
    return false;
  }

  const transactionTimestamp = transaction.date.getTime();

  if (filters.from && transactionTimestamp < filters.from.getTime()) {
    return false;
  }

  if (filters.to && transactionTimestamp > filters.to.getTime()) {
    return false;
  }

  return true;
};

const hasActiveFilters = (filters: TransactionFiltersState) =>
  filters.search.length > 0 ||
  filters.tag !== "ALL" ||
  filters.minAmount.length > 0 ||
  filters.maxAmount.length > 0 ||
  filters.datePreset !== "all" ||
  filters.dateFrom.length > 0 ||
  filters.dateTo.length > 0;

const getDatePresetPatch = (
  preset: DatePreset,
  previous: TransactionFiltersState,
): FiltersPatch => ({
  datePreset: preset,
  dateFrom: preset === "custom" ? previous.dateFrom : "",
  dateTo: preset === "custom" ? previous.dateTo : "",
});

type TransactionFiltersPanelProps = {
  filters: TransactionFiltersState;
  hasActive: boolean;
  onPatch: (patch: FiltersPatch) => void;
  onReset: () => void;
};

const TransactionFiltersPanel = ({
  filters,
  hasActive,
  onPatch,
  onReset,
}: TransactionFiltersPanelProps) => {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Typography tag="h3" variant="title" className="text-xl font-medium">
            Лента транзакций
          </Typography>
          <Typography tag="p" className="text-muted-foreground text-sm">
            Поиск и фильтрация в реальном времени
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {hasActive ? (
            <Button variant="outline" size="sm" onClick={onReset}>
              <FunnelXIcon className="h-4 w-4" />
              Сбросить фильтры
            </Button>
          ) : null}
          <TransactionAddModal />
        </div>
      </div>

      <div className="bg-muted/35 grid gap-3 rounded-lg border p-3 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(event) => onPatch({ search: event.target.value })}
            placeholder="Поиск по названию"
            className="bg-background pl-9"
          />
        </div>

        <Select
          value={filters.tag}
          onValueChange={(value) =>
            onPatch({ tag: value as TransactionFiltersState["tag"] })
          }
        >
          <SelectTrigger className="bg-background w-full">
            <SelectValue placeholder="Тег" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Фильтрация по тегу</SelectLabel>
              <SelectItem value="ALL">Все теги</SelectItem>
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

        <div className="grid grid-cols-2 gap-2">
          <Input
            value={filters.minAmount}
            onChange={(event) => onPatch({ minAmount: event.target.value })}
            inputMode="numeric"
            placeholder="Сумма от"
            className="bg-background"
          />
          <Input
            value={filters.maxAmount}
            onChange={(event) => onPatch({ maxAmount: event.target.value })}
            inputMode="numeric"
            placeholder="Сумма до"
            className="bg-background"
          />
        </div>

        <Select
          value={filters.datePreset}
          onValueChange={(value) =>
            onPatch(getDatePresetPatch(value as DatePreset, filters))
          }
        >
          <SelectTrigger className="bg-background w-full">
            <CalendarRangeIcon className="h-4 w-4" />
            <SelectValue placeholder="Период" />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filters.datePreset === "custom" ? (
          <div className="grid grid-cols-1 gap-2 lg:col-span-5 lg:grid-cols-2">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => onPatch({ dateFrom: event.target.value })}
              className="bg-background"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(event) => onPatch({ dateTo: event.target.value })}
              className="bg-background"
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

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

const TransactionTable = () => {
  const { data, isFetching } = useGetTransactionsQuery({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 12,
  });

  const [filters, setFilters] = useState<TransactionFiltersState>(DEFAULT_FILTERS);

  const patchFilters = (patch: FiltersPatch) => {
    setFilters((previous) => ({ ...previous, ...patch }));
  };

  const transactions = useMemo(() => {
    if (!data) return [];
    return data.map((transaction) => transactionGetSchema.parse(transaction));
  }, [data]);

  const filteredTransactions = useMemo(() => {
    const normalizedFilters = normalizeFilters(filters);
    return transactions.filter((transaction) =>
      matchesTransactionFilters(transaction, normalizedFilters),
    );
  }, [filters, transactions]);

  useEffect(() => {
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
  }, [filters]);

  const table = useReactTable<TransactionRow>({
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    enableSorting: true,
  });

  const rows = table.getRowModel().rows;
  const hasAnyTransactions = transactions.length > 0;

  return (
    <Card className="relative gap-3 py-5.5">
      <CardHeader className="flex flex-col gap-4">
        <TransactionFiltersPanel
          filters={filters}
          hasActive={hasActiveFilters(filters)}
          onPatch={patchFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </CardHeader>

      <CardContent>
        {isFetching && (
          <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
            <Typography tag="span">Загрузка...</Typography>
          </div>
        )}

        <TransactionsTableGrid
          table={table}
          rows={rows}
          hasAnyTransactions={hasAnyTransactions}
        />
      </CardContent>

      <CardFooter className="min-h-14 justify-between gap-2">
        <Typography tag="p" className="text-muted-foreground text-sm">
          Найдено: {filteredTransactions.length}
        </Typography>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            size="sm"
            variant="outline"
          >
            <ArrowLeftIcon />
          </Button>

          <Typography tag="p" variant="default" className="min-w-14 text-center">
            {table.getState().pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
          </Typography>

          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            size="sm"
            variant="outline"
          >
            <ArrowRightIcon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export { TransactionTable };
