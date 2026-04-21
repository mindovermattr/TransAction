import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardLoadingState = () => (
  <div className="space-y-4 lg:space-y-5">
    <section className="bg-card rounded-xl border p-4 lg:p-5">
      <div className="flex items-start gap-2.5">
        <SidebarTrigger />
        <div className="w-full space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    </section>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-[152px] rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-[148px] rounded-xl" />
    <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
      <Skeleton className="h-[380px] rounded-xl" />
      <div className="grid gap-4">
        <Skeleton className="h-[182px] rounded-xl" />
        <Skeleton className="h-[182px] rounded-xl" />
      </div>
    </div>
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Skeleton className="h-[360px] rounded-xl" />
      <Skeleton className="h-[360px] rounded-xl" />
    </div>
  </div>
);

export { DashboardLoadingState };
