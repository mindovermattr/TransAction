import { BadgeDollarSignIcon, TrendingUpIcon, UserIcon } from "lucide-react";

import { SidebarNav } from "@/components/Sidebar/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getUserFromLS } from "@/lib/localstorage";
import { ROUTES } from "@/router/routes";
import type { ComponentProps } from "react";
import { Typography } from "../ui/typography";

const data = {
  projects: [
    {
      name: "Транзакции",
      url: ROUTES.TRANSACTIONS,
      icon: BadgeDollarSignIcon,
    },
    {
      name: "Анализ",
      url: ROUTES.ANALYTICS,
      icon: TrendingUpIcon,
    },
  ],
};
const AppSidebar = ({ ...props }: ComponentProps<typeof Sidebar>) => {
  const user = getUserFromLS();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <UserIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Typography
                  tag="span"
                  variant="subtitle"
                  className="text-sm leading-none font-medium"
                >
                  {user?.email}
                </Typography>
                <Typography tag="span" className="leading-none capitalize">
                  {user?.name}
                </Typography>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <Button variant={"destructive"}>Logout</Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export { AppSidebar };
