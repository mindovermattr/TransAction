import { TRANSACTION_TAGS_ICONS } from "@/constants/transaction-tags-icons";
import { Button } from "@/components/ui/button";
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
import { Typography } from "@/components/ui/typography";
import { TRANSACTION_TAGS } from "@/schemas/transaction.schema";
import { SelectGroup } from "@radix-ui/react-select";
import { CalendarRangeIcon, FunnelXIcon, SearchIcon } from "lucide-react";
import { TransactionAddModal } from "../modals/transaction-add-modal";
import {
  DATE_PRESETS,
  getDatePresetPatch,
} from "./transaction-table.filters";
import type {
  DatePreset,
  FiltersPatch,
  TransactionFiltersState,
} from "./transaction-table.types";

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

export { TransactionFiltersPanel };
