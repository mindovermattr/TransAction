import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

const Transactions = () => {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </div>
  );
};

export { Transactions };
