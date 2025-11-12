import { SidebarTrigger } from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";

const Analytic = () => {
  return (
    <div>
      <header className="flex items-center gap-2">
        <SidebarTrigger />
        <Typography tag="h1" variant="title">
          Аналитика
        </Typography>
      </header>
    </div>
  );
};

export { Analytic };
