import { Skeleton } from "@/components/ui/skeleton";

const SubscriptionsLoadingState = () => (
  <div className="space-y-4 lg:space-y-5">
    <section className="bg-card rounded-xl border p-4 lg:p-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
    </section>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-[148px] rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-[176px] rounded-xl" />
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
      <Skeleton className="h-[440px] rounded-xl" />
      <div className="grid gap-4">
        <Skeleton className="h-[160px] rounded-xl" />
        <Skeleton className="h-[160px] rounded-xl" />
        <Skeleton className="h-[160px] rounded-xl" />
      </div>
    </div>
    <Skeleton className="h-[360px] rounded-xl" />
  </div>
);

export { SubscriptionsLoadingState };
