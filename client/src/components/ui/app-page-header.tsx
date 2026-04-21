import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";
import type { ReactNode } from "react";

const AppPageHeader = ({
  title,
  description,
  titleSlot,
  rightSlot,
}: {
  title: string;
  description: string;
  titleSlot?: ReactNode;
  rightSlot?: ReactNode;
}) => (
  <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div className="flex items-start gap-3">
      <SidebarTrigger className="mt-0.5" />
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Typography tag="h1" variant="title" className="text-2xl">
            {title}
          </Typography>
          {titleSlot}
        </div>
        <Typography tag="p" className="text-muted-foreground text-sm">
          {description}
        </Typography>
      </div>
    </div>

    {rightSlot ? <div className="flex flex-col items-start gap-2 sm:items-end">{rightSlot}</div> : null}
  </header>
);

export { AppPageHeader };
