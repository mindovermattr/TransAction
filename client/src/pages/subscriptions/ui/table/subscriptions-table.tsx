import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SemanticStatusBadge } from "@/components/ui/semantic-status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { formatRubCurrency } from "@/lib/formatters";
import { ACCOUNT_TYPE_LABELS } from "@/schemas/account.schema";
import {
  SUBSCRIPTION_BILLING_CYCLE_LABELS,
  SUBSCRIPTION_BILLING_CYCLES,
  SUBSCRIPTION_CATEGORY_LABELS,
  SUBSCRIPTION_CATEGORY_TAGS,
  type SubscriptionRecord,
} from "@/schemas/subscription.schema";
import { SearchIcon, PauseIcon, PencilIcon, PlayIcon, Trash2Icon } from "lucide-react";
import {
  formatNextChargeDate,
  getDueStatus,
  getRelativeDueLabel,
  normalizeMonthlyAmount,
  type SubscriptionAccountOption,
  type SubscriptionsTableFilters,
} from "../../lib";

const SubscriptionsTable = ({
  accountOptions,
  filters,
  subscriptions,
  updateFilters,
  onDisable,
  onEdit,
  onToggleActive,
}: {
  accountOptions: SubscriptionAccountOption[];
  filters: SubscriptionsTableFilters;
  subscriptions: SubscriptionRecord[];
  updateFilters: (patch: Partial<SubscriptionsTableFilters>) => void;
  onDisable: (subscription: SubscriptionRecord) => void;
  onEdit: (subscription: SubscriptionRecord) => void;
  onToggleActive: (subscriptionId: number) => void;
}) => (
  <>
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.8fr))_auto]">
      <div className="relative">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={filters.search}
          onChange={(event) => updateFilters({ search: event.target.value })}
          className="pl-9"
          placeholder="Поиск по названию"
        />
      </div>
      <Select
        value={filters.statusFilter}
        onValueChange={(value) => updateFilters({ statusFilter: value as SubscriptionsTableFilters["statusFilter"] })}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="dueSoon">Скоро</SelectItem>
          <SelectItem value="later">Позже</SelectItem>
          <SelectItem value="paused">На паузе</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.accountFilter} onValueChange={(value) => updateFilters({ accountFilter: value })}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Счёт" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Все счета</SelectItem>
          {accountOptions.map((account) => (
            <SelectItem key={account.id} value={String(account.id)}>
              {account.name} • {ACCOUNT_TYPE_LABELS[account.type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.categoryFilter} onValueChange={(value) => updateFilters({ categoryFilter: value })}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Категория" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Все категории</SelectItem>
          {SUBSCRIPTION_CATEGORY_TAGS.map((category) => (
            <SelectItem key={category} value={category}>
              {SUBSCRIPTION_CATEGORY_LABELS[category]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.cycleFilter} onValueChange={(value) => updateFilters({ cycleFilter: value })}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Цикл" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Все циклы</SelectItem>
          {SUBSCRIPTION_BILLING_CYCLES.map((cycle) => (
            <SelectItem key={cycle} value={cycle}>
              {SUBSCRIPTION_BILLING_CYCLE_LABELS[cycle]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant={filters.activeOnly ? "default" : "outline"}
        onClick={() => updateFilters({ activeOnly: !filters.activeOnly })}
      >
        Только активные
      </Button>
    </div>

    {subscriptions.length === 0 ? (
      <div className="bg-muted/35 rounded-xl border border-dashed px-4 py-10 text-center">
        <SearchIcon className="text-muted-foreground mx-auto h-8 w-8" />
        <Typography tag="p" className="mt-4 text-base font-semibold">
          Нет подписок по текущим фильтрам
        </Typography>
        <Typography tag="p" className="text-muted-foreground mt-1 text-sm">
          Сбросьте фильтры или добавьте новую подписку.
        </Typography>
      </div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Цикл</TableHead>
            <TableHead>Следующее списание</TableHead>
            <TableHead>Счёт</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => {
            const account = accountOptions.find((item) => item.id === subscription.accountId) ?? accountOptions[0];
            const status = getDueStatus(subscription);

            return (
              <TableRow key={subscription.id}>
                <TableCell>
                  <div className="min-w-[180px]">
                    <Typography tag="p" className="text-sm font-medium">
                      {subscription.name}
                    </Typography>
                    <Typography tag="p" className="text-muted-foreground text-xs">
                      {subscription.billingCycle === "yearly"
                        ? `Годовая подписка, учтена как ${formatRubCurrency(normalizeMonthlyAmount(subscription))}/мес`
                        : "Ежемесячное списание"}
                    </Typography>
                  </div>
                </TableCell>
                <TableCell>{formatRubCurrency(subscription.amount)}</TableCell>
                <TableCell>{SUBSCRIPTION_BILLING_CYCLE_LABELS[subscription.billingCycle]}</TableCell>
                <TableCell>
                  <div className="min-w-[128px]">
                    <Typography tag="p" className="text-sm font-medium">
                      {formatNextChargeDate(subscription.nextChargeDate)}
                    </Typography>
                    <Typography tag="p" className="text-muted-foreground text-xs">
                      {getRelativeDueLabel(subscription.nextChargeDate)}
                    </Typography>
                  </div>
                </TableCell>
                <TableCell>{account?.name}</TableCell>
                <TableCell>{SUBSCRIPTION_CATEGORY_LABELS[subscription.categoryTag]}</TableCell>
                <TableCell>
                  <SemanticStatusBadge tone={status.tone}>{status.label}</SemanticStatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(subscription)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onToggleActive(subscription.id)}>
                      {subscription.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDisable(subscription)}>
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )}
  </>
);

export { SubscriptionsTable };
