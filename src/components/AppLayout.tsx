import { Outlet } from "react-router-dom";
import { AppTopNav } from "./AppSidebar";

export function AppLayout() {
  return (
    <div className="h-screen bg-background p-2 flex flex-col gap-2 overflow-hidden">
      <AppTopNav />
      <main className="flex-1 bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

