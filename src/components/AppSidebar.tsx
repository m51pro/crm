import { CalendarDays, Users, FileText, Settings, Bell, Search } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { title: "Шахматка", path: "/", icon: CalendarDays },
  { title: "Клиенты", path: "/clients", icon: Users },
  { title: "Договоры", path: "/contracts", icon: FileText },
  { title: "Шаблоны", path: "/templates", icon: FileText },
  { title: "Настройки", path: "/settings", icon: Settings },
];

export function AppTopNav() {
  const location = useLocation();

  return (
    <header className="bg-[hsl(var(--sidebar-bg))] rounded-2xl flex items-center justify-between px-5 h-14 shadow-[0_10px_30px_rgba(15,23,42,0.18)] shrink-0 border border-white/5 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-5 shrink-0">
        <div>
          <h1 className="font-heading text-[13px] font-bold text-[hsl(var(--sidebar-fg))] tracking-tight leading-none">
            CRM Коттеджи
          </h1>
          <p className="text-[10px] text-[hsl(var(--sidebar-muted))] leading-none mt-0.5">
            Управление бронированием
          </p>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* Brand indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-2.5 py-1.5 cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-chunga shadow-sm shadow-chunga/50" />
            <span className="text-[10px] font-semibold text-[hsl(var(--sidebar-muted))] tracking-wide">
              Чунга-Чанга
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-2.5 py-1.5 cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-bukhta shadow-sm shadow-bukhta/50" />
            <span className="text-[10px] font-semibold text-[hsl(var(--sidebar-muted))] tracking-wide">
              Голубая Бухта
            </span>
          </div>
        </div>
      </div>

      {/* Nav pill group — center */}
      <nav className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-fg))] shadow-md"
                  : "text-[hsl(var(--sidebar-fg))] hover:bg-white/8 hover:text-white"
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Right: search + actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--sidebar-muted))]" />
          <Input
            placeholder="Поиск..."
            className="pl-9 w-48 h-8 bg-white/6 border border-white/8 text-[13px] rounded-xl text-[hsl(var(--sidebar-fg))] placeholder:text-[hsl(var(--sidebar-muted))] focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl h-8 w-8 text-[hsl(var(--sidebar-muted))] hover:bg-white/8 hover:text-[hsl(var(--sidebar-fg))]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-chunga" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
