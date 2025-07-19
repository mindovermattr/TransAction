import { BadgeDollarSignIcon, TrendingUpIcon } from "lucide-react";

import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { ComponentProps } from "react";

const data = {
  projects: [
    {
      name: "Транзакции",
      url: "#",
      icon: BadgeDollarSignIcon,
    },
    {
      name: "Анализ",
      url: "#",
      icon: TrendingUpIcon,
    },
  ],
};
const AppSidebar = ({ ...props }: ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        Profile
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <Nav projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <Button className="hover:bg-blue-300" variant={"destructive"}>
          Logout
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export { AppSidebar };
