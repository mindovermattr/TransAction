import { AppPageHeader } from "@/components/ui/app-page-header";
import { Button } from "@/components/ui/button";
import { SemanticStatusBadge } from "@/components/ui/semantic-status-badge";
import { RepeatIcon } from "lucide-react";
import { useSubscriptionsState } from "./subscriptions.hooks";
import {
  EmptySubscriptionsState,
  SubscriptionDisableDialog,
  SubscriptionFormDialog,
  SubscriptionsDemoBanner,
  SubscriptionsLoadingState,
  SubscriptionsMainContent,
  SubscriptionsOverview,
  SubscriptionsTable,
} from "./ui";

const Subscriptions = () => {
  const state = useSubscriptionsState();

  if (state.isInitialLoading) {
    return <SubscriptionsLoadingState />;
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <AppPageHeader
        title="Подписки"
        description="Регулярные списания, ближайшая нагрузка и контроль автоплатежей"
        rightSlot={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SemanticStatusBadge tone={state.syncBadge.tone}>{state.syncBadge.label}</SemanticStatusBadge>
            <Button onClick={() => state.setIsCreateOpen(true)}>
              <RepeatIcon className="h-4 w-4" />
              Добавить подписку
            </Button>
          </div>
        }
      />

      {state.isDemoMode ? <SubscriptionsDemoBanner /> : null}

      {state.subscriptions.length === 0 ? (
        <EmptySubscriptionsState onCreate={() => state.setIsCreateOpen(true)} />
      ) : (
        <>
          <SubscriptionsOverview summary={state.summary} statusDistribution={state.statusDistribution} />
          <SubscriptionsMainContent
            categoryDistribution={state.categoryDistribution}
            onCreate={() => state.setIsCreateOpen(true)}
            onEdit={state.setEditingSubscription}
            recurringLoadByAccount={state.recurringLoadByAccount}
            statusDistribution={state.statusDistribution}
            summary={state.summary}
            timelineWindow={state.timelineWindow}
            upcomingGroups={state.upcomingGroups}
            onTimelineWindowChange={state.setTimelineWindow}
          />
          <section className="bg-card rounded-xl border px-5 py-5">
            <div className="mb-4 space-y-1">
              <h2 className="text-foreground text-lg font-semibold">Все подписки</h2>
              <p className="text-muted-foreground text-sm">Редактирование, пауза, смена счёта и даты списания</p>
            </div>
            <SubscriptionsTable
              accountOptions={state.accountOptions}
              filters={state.filters}
              subscriptions={state.filteredSubscriptions}
              updateFilters={state.updateFilters}
              onDisable={state.setSubscriptionToDisable}
              onEdit={state.setEditingSubscription}
              onToggleActive={state.toggleSubscriptionActive}
            />
          </section>
        </>
      )}

      <SubscriptionFormDialog
        open={state.isCreateOpen}
        onOpenChange={state.setIsCreateOpen}
        accounts={state.accountOptions}
        title="Новая подписка"
        description="Списания появятся в recurring-нагрузке и ближайшем таймлайне"
        onSubmit={state.upsertSubscription}
      />

      <SubscriptionFormDialog
        open={Boolean(state.editingSubscription)}
        onOpenChange={(open) => {
          if (!open) {
            state.setEditingSubscription(null);
          }
        }}
        accounts={state.accountOptions}
        initialValues={state.editingSubscription}
        title="Редактировать подписку"
        description="Измените дату, счёт, категорию или переведите подписку на паузу"
        onSubmit={state.upsertSubscription}
      />

      <SubscriptionDisableDialog
        open={Boolean(state.subscriptionToDisable)}
        onOpenChange={(open) => {
          if (!open) {
            state.setSubscriptionToDisable(null);
          }
        }}
        onConfirm={() => {
          if (!state.subscriptionToDisable) return;
          state.disableSubscription(state.subscriptionToDisable.id);
        }}
      />
    </div>
  );
};

export { Subscriptions };
