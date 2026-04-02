import { Outlet } from "react-router-dom";
import { AppTopNav } from "./AppSidebar";

export function AppLayout() {
  return (
    <div className="h-screen bg-background text-foreground p-3 flex flex-col gap-3 overflow-hidden">
      <AppTopNav />
      <main className="flex-1 rounded-3xl border border-border/60 bg-card/80 shadow-[0_12px_40px_rgba(15,23,42,0.08)] overflow-hidden min-h-0 backdrop-blur-sm">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

