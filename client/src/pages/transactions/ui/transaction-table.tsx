import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useGetTransactionsQuery } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { transactionGetSchema } from "@/schemas/transaction.schema";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { columns } from "../transaction-columns";
import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  matchesTransactionFilters,
  normalizeFilters,
} from "./transaction-table.filters";
import { TransactionFiltersPanel } from "./transaction-filters-panel";
import type {
  FiltersPatch,
  PaginationState,
  TransactionFiltersState,
  TransactionRow,
} from "./transaction-table.types";
import { TransactionsTableGrid } from "./transactions-table-grid";

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
