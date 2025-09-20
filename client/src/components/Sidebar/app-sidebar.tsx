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
  useSidebar,
} from "@/components/ui/sidebar";
import { getUserFromLS } from "@/lib/localstorage";
import { ROUTES } from "@/router/routes";
import { Separator } from "@radix-ui/react-separator";
import type { ComponentProps } from "react";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
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
  const sidebar = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild size={"lg"}>
              <div>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 h-full items-center justify-center rounded-lg">
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
                <AnimatedThemeToggler className="ml-auto" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {sidebar.state === "collapsed" && (
            <>
              <SidebarMenuItem className="mt-2 self-center">
                <AnimatedThemeToggler />
              </SidebarMenuItem>
              <Separator
                orientation="horizontal"
                className="bg-primary h-0.25"
              />
            </>
          )}
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
